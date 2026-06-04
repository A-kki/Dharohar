import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { getReviewedAssets } from '../../services/assetService';
import type { Asset } from '../../services/assetService';
import { useTranslation } from 'react-i18next';

export const ReviewHistory = () => {
    const { t } = useTranslation();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'REJECTED'>('ALL');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getReviewedAssets();
                setAssets(data);
            } catch (e: any) {
                setError(e.response?.data?.message || t('reviewHistory.loadError', 'Failed to load review history.'));
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const displayed = assets
        .filter(a => filter === 'ALL' || a.approvalStatus === filter)
        .filter(a =>
            !search ||
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.communityName.toLowerCase().includes(search.toLowerCase())
        );

    const approvedCount = assets.filter(a => a.approvalStatus === 'APPROVED').length;
    const rejectedCount = assets.filter(a => a.approvalStatus === 'REJECTED').length;

    return (
        <DashboardLayout title={t('reviewHistory.title', 'Review History')}>
            <div style={{ animation: 'fadeIn var(--transition-base)' }}>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
                    {t('reviewHistory.subtitle', 'All assets you have previously approved or rejected. Decisions are final and server-enforced.')}
                </p>

                {/* Summary strip */}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    {[
                        { label: t('reviewHistory.totalReviewed', 'Total Reviewed'), value: assets.length, color: 'var(--color-text-main)' },
                        { label: t('reviewHistory.approved', 'Approved'), value: approvedCount, color: '#14532d' },
                        { label: t('reviewHistory.rejected', 'Rejected'), value: rejectedCount, color: '#7f1d1d' },
                    ].map(s => (
                        <div key={s.label} style={{ padding: '1rem 1.5rem', border: '1px solid var(--color-muted-gold)', borderRadius: '2px', minWidth: '140px', textAlign: 'center', background: 'var(--color-bg-light)' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-light)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {(['ALL', 'APPROVED', 'REJECTED'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={filter === f ? 'primary-btn' : 'minimal-btn'}
                                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                            >
                                {f === 'ALL' ? t('common.all', 'All') : t(`common.${f.toLowerCase()}`, f.charAt(0) + f.slice(1).toLowerCase())}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder={t('reviewHistory.searchPlaceholder', 'Search by title or community...')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--color-muted-gold)', borderRadius: '2px', fontSize: '0.875rem', flex: 1, minWidth: '220px', background: 'white' }}
                    />
                </div>

                {isLoading && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>{t('reviewHistory.loading', 'Loading history...')}</div>}
                {error && <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid #ef4444', borderRadius: '4px', color: '#7f1d1d' }}>{error}</div>}

                {!isLoading && !error && displayed.length === 0 && (
                    <div className="no-data">
                        {assets.length === 0 ? t('reviewHistory.noAssets', 'No reviewed assets yet. Decisions will appear here after you approve or reject from the Review Queue.') : t('reviewHistory.noMatch', 'No assets match the current filter.')}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {displayed.map(asset => (
                        <div key={asset.id} className="framed-section" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                                <div>
                                    <h4 style={{ margin: 0, marginBottom: '0.2rem' }}>{asset.title}</h4>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                                        {asset.communityName}
                                        {(asset.createdBy as any)?.name && ` · ${t('reviewHistory.submittedBy', 'Submitted by')} ${(asset.createdBy as any).name}`}
                                        {` · ${asset.type} · `}
                                        {new Date(asset.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    {asset.riskTier && <span className={`tag status ${asset.riskTier.toLowerCase()}`}>{t(`common.risk${asset.riskTier.charAt(0).toUpperCase() + asset.riskTier.slice(1).toLowerCase()}`, asset.riskTier)} RISK</span>}
                                    <StatusBadge status={asset.approvalStatus} />
                                </div>
                            </div>

                            <p style={{ margin: '0.75rem 0 0', fontSize: '0.9rem', color: 'var(--color-text-main)', fontStyle: 'italic' }}>
                                "{asset.description}"
                            </p>

                            {/* Media preview */}
                            {asset.mediaUrl && (
                                <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--color-muted-gold)', borderRadius: '2px' }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: '0.4rem' }}>{t('reviewHistory.archivedMedia', 'Archived Media:')}</p>
                                    {asset.mediaUrl.match(/\.(mp4|webm|ogv)$/i)
                                        ? <video controls style={{ width: '100%', maxHeight: '150px' }} src={asset.mediaUrl} />
                                        : <audio controls style={{ width: '100%' }} src={asset.mediaUrl} />
                                    }
                                </div>
                            )}

                            {/* Rejection reason */}
                            {asset.approvalStatus === 'REJECTED' && asset.reviewComment && (
                                <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.05)', border: '1px solid #ef4444', borderRadius: '4px', fontSize: '0.85rem' }}>
                                    <strong style={{ color: '#7f1d1d' }}>{t('reviewHistory.rejectionReason', 'Rejection Reason:')}</strong>
                                    <p style={{ margin: '0.25rem 0 0' }}>{asset.reviewComment}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};
