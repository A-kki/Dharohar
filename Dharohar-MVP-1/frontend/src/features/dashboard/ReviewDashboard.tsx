import { useState, useEffect } from 'react';
import { FiMic, FiCpu, FiAlertTriangle } from 'react-icons/fi';
import { StatusBadge } from '../../components/StatusBadge';
import { getPendingAssets, approveAsset, rejectAsset } from '../../services/assetService';
import type { Asset } from '../../services/assetService';
import { RoleMediaPlayer } from '../../components/RoleMediaPlayer';
import { Loader } from '../../components/Loader/Loader';
import { useNotificationSound } from '../../hooks/useNotificationSound';
import { useTranslation } from 'react-i18next';
import './ReviewDashboard.css';

export const ReviewDashboard = () => {
    const { t } = useTranslation();
    const [pendingAssets, setPendingAssets] = useState<Asset[]>([]);
    const [reviewComments, setReviewComments] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isActioning, setIsActioning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<Record<string, string>>({});
    const playSound = useNotificationSound();

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getPendingAssets();
                setPendingAssets(data);
            } catch (e: any) {
                setError(e.response?.data?.message || t('review.loadFailed', 'Failed to load review queue. Is the server running?'));
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const handleApprove = async (id: string) => {
        setIsActioning(true);
        try {
            await approveAsset(id);
            // Play sound on approval
            playSound();
            // Remove from queue
            setPendingAssets(prev => prev.filter(a => a.id !== id));
            setActionError(prev => ({ ...prev, [id]: '' }));
        } catch (e: any) {
            setActionError(prev => ({ ...prev, [id]: e.response?.data?.message || t('review.approveFailed', 'Approve failed') }));
        } finally {
            setIsActioning(false);
        }
    };

    const handleReject = async (id: string) => {
        const comment = reviewComments[id] || '';
        if (!comment.trim()) {
            setActionError(prev => ({ ...prev, [id]: t('review.rejectReasonRequired', 'A review comment is required to reject a submission.') }));
            return;
        }
        setIsActioning(true);
        try {
            await rejectAsset(id, comment);
            playSound();
            setPendingAssets(prev => prev.filter(a => a.id !== id));
            setActionError(prev => ({ ...prev, [id]: '' }));
        } catch (e: any) {
            setActionError(prev => ({ ...prev, [id]: e.response?.data?.message || t('review.rejectFailed', 'Reject failed') }));
        } finally {
            setIsActioning(false);
        }
    };

    return (
        <div className="review-dashboard">
            {isActioning && <Loader label={t('review.processingDecision', 'Processing decision...')} />}
            <header className="dashboard-header-inner">
                <h3>{t('review.header', 'Asset Review Queue')}</h3>
                <p>{t('review.headerDescription', 'Institutional verification of tribal metadata and cultural integrity. All decisions are final and server-enforced.')}</p>
            </header>

            {isLoading && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
                    {t('review.loadingQueue', 'Loading review queue...')}
                </div>
            )}

            {error && (
                <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid #ef4444', borderRadius: '4px', color: '#7f1d1d', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            <div className="pending-list">
                {!isLoading && !error && pendingAssets.length === 0 && (
                    <div className="empty-state">
                        <StatusBadge status="APPROVED" />
                        <p>{t('review.emptyQueue', 'No records awaiting verification. The queue is clear.')}</p>
                    </div>
                )}

                {pendingAssets.map(asset => (
                    <div key={asset.id} className="review-card framed-section" style={{ padding: '2rem' }}>
                        <div className="review-card-header">
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <StatusBadge status={asset.approvalStatus} />
                                <span className={`tag type-badge`} style={{
                                    background: asset.type === 'BIO' ? 'rgba(46,125,50,0.1)' : 'rgba(2,136,209,0.1)',
                                    color: asset.type === 'BIO' ? 'var(--color-forest)' : '#0288d1',
                                    padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700
                                }}>
                                    DHAROHAR-{asset.type}
                                </span>
                                {asset.riskTier && (
                                    <span className={`tag status ${asset.riskTier?.toLowerCase()}`}>{asset.riskTier ? t(`common.risk${asset.riskTier.charAt(0).toUpperCase() + asset.riskTier.slice(1).toLowerCase()}`) : 'Risk'} ROLE</span>
                                )}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                                {new Date(asset.createdAt).toLocaleString()}
                            </div>
                        </div>

                        <div className="review-card-body" style={{ marginTop: '1.5rem' }}>
                            <h4 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{asset.title}</h4>
                            <h5 style={{ color: 'var(--color-terracotta)', fontWeight: 600 }}>{asset.communityName}</h5>

                            {asset.createdBy && (
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>
                                    {t('review.submittedBy', 'Submitted by:')} <strong>{(asset.createdBy as any).name}</strong> ({(asset.createdBy as any).email})
                                </p>
                            )}

                            <div className="archive-dossier" style={{ marginTop: '1.5rem', background: 'rgba(0,0,0,0.02)', padding: '1rem', border: '1px solid var(--color-muted-gold)' }}>
                                <p className="asset-description" style={{ fontStyle: 'italic', marginBottom: '1rem' }}>"{asset.description}"</p>

                                {/* Full media player for reviewer — no restrictions */}
                                {asset.mediaUrl ? (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <RoleMediaPlayer
                                            src={asset.mediaUrl}
                                            mode="full"
                                            assetId={asset.type === 'SONIC' ? asset.mediaFileId : asset.id}
                                            assetType={asset.type}
                                            label={asset.type === 'SONIC' ? `🎵 ${t('review.listenSonic', 'Sonic Archive — Listen before reviewing:')}` : `🎙 ${t('review.listenVoice', 'Voice Archive — Listen before reviewing:')}`}
                                        />
                                    </div>
                                ) : (
                                    <div className="media-verification" style={{ display: 'flex', gap: '1rem' }}>
                                        <div className="media-status-pill" style={{ opacity: 0.5 }}>
                                            <FiMic /> {t('review.noMediaUpload', 'No media file uploaded')}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── AI Governance Insight Panel ─────────────────────── */}
                            <div style={{
                                marginTop: '1.5rem',
                                border: '1px solid rgba(99,102,241,0.3)',
                                borderRadius: '6px',
                                background: 'rgba(99,102,241,0.04)',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    padding: '0.6rem 1rem',
                                    background: 'rgba(99,102,241,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    borderBottom: '1px solid rgba(99,102,241,0.2)'
                                }}>
                                    <FiCpu size={14} color="#6366f1" />
                                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6366f1', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                        {t('review.aiInsightHeader', 'AI Governance Insight')}
                                    </span>
                                    <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--color-text-light)', fontStyle: 'italic' }}>
                                        {t('review.advisoryOnly', 'Advisory only — reviewer decision is final')}
                                    </span>
                                </div>

                                {asset.aiProcessed && asset.aiMetadata ? (
                                    <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>

                                        {/* Domain */}
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('review.aiDomain', 'Domain')}</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                                                {asset.aiMetadata.domainClassification ?? '—'}
                                            </div>
                                        </div>

                                        {/* Suggested License Type */}
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('review.aiSuggestedLicense', 'Suggested License')}</div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6366f1' }}>
                                                {asset.aiMetadata.suggestedLicenseType ?? '—'}
                                            </div>
                                        </div>

                                        {/* Risk Tier Suggestion */}
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('review.aiRiskTierSuggestion', 'AI Risk Tier Suggestion')}</div>
                                            {asset.aiMetadata.riskTierSuggestion ? (
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '0.2rem 0.7rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700,
                                                    background: asset.aiMetadata.riskTierSuggestion === 'HIGH'
                                                        ? 'rgba(239,68,68,0.12)'
                                                        : asset.aiMetadata.riskTierSuggestion === 'MEDIUM'
                                                            ? 'rgba(245,158,11,0.12)'
                                                            : 'rgba(34,197,94,0.12)',
                                                    color: asset.aiMetadata.riskTierSuggestion === 'HIGH'
                                                        ? '#ef4444'
                                                        : asset.aiMetadata.riskTierSuggestion === 'MEDIUM'
                                                            ? '#d97706'
                                                            : '#16a34a'
                                                }}>
                                                    {asset.aiMetadata.riskTierSuggestion ? t(`common.risk${asset.aiMetadata.riskTierSuggestion.charAt(0).toUpperCase() + asset.aiMetadata.riskTierSuggestion.slice(1).toLowerCase()}`) : 'Risk'} ROLE
                                                </span>
                                            ) : '—'}
                                        </div>

                                        {/* Sensitive Content Flag */}
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('review.sensitiveContent', 'Sensitive Content')}</div>
                                            {asset.aiMetadata.sensitiveContentFlag ? (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 700, color: '#dc2626' }}>
                                                    <FiAlertTriangle size={13} /> {t('review.sensitiveYes', 'Yes — Review Carefully')}
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>✓ {t('review.sensitiveNo', 'No sensitive content flagged')}</span>
                                            )}
                                        </div>

                                        {/* AI Summary — full row */}
                                        {asset.aiMetadata.summary && (
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('review.aiSummary', 'AI Summary')}</div>
                                                <p style={{ fontSize: '0.87rem', color: 'var(--color-ink)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                                                    {asset.aiMetadata.summary}
                                                </p>
                                            </div>
                                        )}

                                        {/* Keywords — full row */}
                                        {asset.aiMetadata.keywords && asset.aiMetadata.keywords.length > 0 && (
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('common.keywordsTitle', 'Keywords')}</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                                    {asset.aiMetadata.keywords.map((kw, i) => (
                                                        <span key={i} style={{
                                                            padding: '0.2rem 0.65rem',
                                                            background: 'rgba(99,102,241,0.1)',
                                                            color: '#6366f1',
                                                            borderRadius: '20px',
                                                            fontSize: '0.78rem',
                                                            fontWeight: 600
                                                        }}>
                                                            {kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--color-text-light)', fontStyle: 'italic' }}>
                                        {t('review.aiMetadataNotGenerated', 'AI metadata not generated for this submission.')}
                                    </div>
                                )}
                            </div>
                            {/* ────────────────────────────────────────────────────── */}

                            <div className="reviewer-input" style={{ marginTop: '1.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                                    {t('review.reviewComment', 'Review Comment')} <span style={{ color: '#ef4444' }}>*{t('review.requiredForRejection', 'Required for Rejection')}</span>
                                </label>
                                <textarea
                                    placeholder={t('review.commentPlaceholder', 'Add comments regarding cultural sensitivity, metadata accuracy, or rejection reason...')}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-muted-gold)', borderRadius: '2px', minHeight: '80px' }}
                                    value={reviewComments[asset.id] || ''}
                                    onChange={e => setReviewComments(prev => ({ ...prev, [asset.id]: e.target.value }))}
                                />
                            </div>

                            {actionError[asset.id] && (
                                <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                    ⚠ {actionError[asset.id]}
                                </p>
                            )}
                        </div>

                        <div className="review-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                className="minimal-btn danger-text"
                                onClick={() => handleReject(asset.id)}
                            >
                                {t('review.rejectSubmission', 'Reject Submission')}
                            </button>
                            <button
                                className="primary-btn"
                                onClick={() => handleApprove(asset.id)}
                            >
                                {t('review.approveSubmission', 'Approve for Archive')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
