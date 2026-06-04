import { useState, useEffect } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { getPendingLicenses, approveLicense, rejectLicense, requestModification } from '../../services/licenseService';
import type { License } from '../../services/licenseService';
import { RoleMediaPlayer } from '../../components/RoleMediaPlayer';
import { Loader } from '../../components/Loader/Loader';
import { useNotificationSound } from '../../hooks/useNotificationSound';
import { useTranslation } from 'react-i18next';
import './AdminDashboard.css';

export const AdminDashboard = () => {
    const { t } = useTranslation();
    const [licenses, setLicenses] = useState<License[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActioning, setIsActioning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [adminComments, setAdminComments] = useState<Record<string, string>>({});
    const [actionError, setActionError] = useState<Record<string, string>>({});
    const playSound = useNotificationSound();

    const load = async () => {
        setIsLoading(true);
        try {
            const data = await getPendingLicenses();
            setLicenses(data);
        } catch (e: any) {
            setError(e.response?.data?.message || t('admin.loadFailed', 'Failed to load license requests. Is the server running?'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleApprove = async (id: string) => {
        setIsActioning(true);
        try {
            await approveLicense(id);
            playSound();
            setLicenses(prev => prev.filter(l => l.id !== id));
        } catch (e: any) {
            setActionError(prev => ({ ...prev, [id]: e.response?.data?.message || t('admin.approvalFailed', 'Approval failed') }));
        } finally {
            setIsActioning(false);
        }
    };

    const handleReject = async (id: string) => {
        const comment = adminComments[id] || '';
        if (!comment.trim()) {
            setActionError(prev => ({ ...prev, [id]: t('admin.commentRequiredReject', 'A comment is required to reject an application.') }));
            return;
        }
        setIsActioning(true);
        try {
            await rejectLicense(id, comment);
            playSound();
            setLicenses(prev => prev.filter(l => l.id !== id));
        } catch (e: any) {
            setActionError(prev => ({ ...prev, [id]: e.response?.data?.message || t('admin.rejectionFailed', 'Rejection failed') }));
        } finally {
            setIsActioning(false);
        }
    };

    const handleRequestModification = async (id: string) => {
        const comment = adminComments[id] || '';
        if (!comment.trim()) {
            setActionError(prev => ({ ...prev, [id]: t('admin.commentRequiredModification', 'A comment explaining the required modification is mandatory.') }));
            return;
        }
        try {
            await requestModification(id, comment);
            playSound();
            setLicenses(prev => prev.filter(l => l.id !== id));
        } catch (e: any) {
            setActionError(prev => ({ ...prev, [id]: e.response?.data?.message || t('admin.modificationFailed', 'Failed to send modification request') }));
        }
    };

    return (
        <div className="admin-dashboard">
            {isActioning && <Loader label={t('admin.processing', 'Processing decision...')} />}
            <header className="dashboard-header-inner">
                <h3>{t('admin.title', 'License Requests')}</h3>
                <p>{t('admin.subtitle', 'Govern commercial and research access to cultural archives. All decisions are enforced server-side.')}</p>
            </header>

            {isLoading && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
                    {t('admin.loading', 'Loading license requests...')}
                </div>
            )}

            {error && (
                <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid #ef4444', borderRadius: '4px', color: '#7f1d1d', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            <div className="request-list">
                {!isLoading && !error && licenses.length === 0 && (
                    <div className="empty-state">
                        <p>{t('admin.noRequests', 'No pending license requests at this time.')}</p>
                    </div>
                )}

                {licenses.map(license => {
                    const asset = typeof license.assetId === 'object' ? license.assetId : null;
                    const applicant = typeof license.applicantId === 'object' ? license.applicantId : null;

                    return (
                        <div key={license.id} className="request-card framed-section">
                            <div className="request-header">
                                <div className="applicant-info">
                                    <h4>{applicant?.name || t('admin.unknownApplicant', 'Unknown Applicant')}</h4>
                                    <span className="request-date">{applicant?.email}</span>
                                    <span className="request-date">{t('admin.applied', 'Applied:')} {new Date(license.createdAt).toLocaleDateString()}</span>
                                </div>
                                <StatusBadge status={license.status} />
                            </div>

                            <div className="request-body">
                                <div className="asset-context">
                                    <strong>{t('admin.requestedAsset', 'Requested Asset:')}</strong> {asset?.title || t('common.na', 'N/A')}
                                    <span className="community-ref">({asset?.communityName})</span>
                                </div>

                                {/* Full media access for admin — no restrictions */}
                                {(asset as any)?.mediaUrl && (
                                    <div style={{ margin: '0.75rem 0' }}>
                                        <RoleMediaPlayer
                                            src={(asset as any).mediaUrl}
                                            mode="full"
                                            assetId={(asset as any).type === 'SONIC' ? (asset as any).mediaFileId : (asset as any).id}
                                            assetType={(asset as any).type}
                                            label={(asset as any)?.type === 'SONIC' ? `🎵 ${t('admin.listenSonic', 'Listen to Asset:')}` : `🎙 ${t('admin.listenVoice', 'Voice Archive:')}`}
                                        />
                                    </div>
                                )}

                                <div className="intended-use-badge">
                                    <strong>{t('admin.licenseType', 'License Type:')}</strong> {license.licenseType.replace('_', ' ')}
                                </div>

                                <div className="justification-box">
                                    <strong>{t('admin.purpose', 'Purpose:')}</strong>
                                    <p>{license.purpose}</p>
                                </div>

                                {license.documentation && (
                                    <div className="justification-box">
                                        <strong>{t('admin.documentation', 'Documentation:')}</strong>
                                        <p>{license.documentation}</p>
                                    </div>
                                )}

                                {/* Admin comment input — required for Reject and Modification */}
                                <div style={{ marginTop: '1.25rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                                        {t('admin.adminComment', 'Admin Comment')} <span style={{ color: '#ef4444' }}>*{t('admin.requiredRejectMod', 'Required for Reject / Modification')}</span>
                                    </label>
                                    <textarea
                                        placeholder={t('admin.commentPlaceholder', 'Provide feedback, rejection reason, or describe what needs to be changed...')}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-muted-gold)', borderRadius: '2px', minHeight: '80px' }}
                                        value={adminComments[license.id] || ''}
                                        onChange={e => setAdminComments(prev => ({ ...prev, [license.id]: e.target.value }))}
                                    />
                                </div>

                                {actionError[license.id] && (
                                    <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                        ⚠ {actionError[license.id]}
                                    </p>
                                )}
                            </div>

                            <div className="request-actions">
                                <button className="minimal-btn danger-text" onClick={() => handleReject(license.id)}>
                                    {t('admin.denyLicense', 'Deny License')}
                                </button>
                                <button
                                    className="minimal-btn"
                                    onClick={() => handleRequestModification(license.id)}
                                    style={{ borderColor: '#3b82f6', color: '#1e3a5f' }}
                                >
                                    {t('admin.requestModification', 'Request Modification')}
                                </button>
                                <button className="primary-btn" onClick={() => handleApprove(license.id)}>
                                    {t('admin.approveContract', 'Approve & Issue Contract')}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
