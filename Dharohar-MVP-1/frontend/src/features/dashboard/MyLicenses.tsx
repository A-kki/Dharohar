import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { RoleMediaPlayer } from '../../components/RoleMediaPlayer';
import { getMyLicenses, resubmitLicense } from '../../services/licenseService';
import type { License, ResubmitPayload } from '../../services/licenseService';
import { useTranslation } from 'react-i18next';

export const MyLicenses = () => {
    const { t } = useTranslation();
    const [licenses, setLicenses] = useState<License[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [resubmitData, setResubmitData] = useState<Record<string, ResubmitPayload>>({});
    const [submitError, setSubmitError] = useState<Record<string, string>>({});
    const [submitSuccess, setSubmitSuccess] = useState<Record<string, string>>({});

    const load = async () => {
        setIsLoading(true);
        try {
            const data = await getMyLicenses();
            setLicenses(data);
        } catch (e: any) {
            setError(e.response?.data?.message || t('myLicenses.loadFailed', 'Failed to load your applications. Is the server running?'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleResubmit = async (id: string) => {
        const payload = resubmitData[id];
        if (!payload?.purpose?.trim()) {
            setSubmitError(prev => ({ ...prev, [id]: t('myLicenses.updatePurposeError', 'Please update the purpose field before resubmitting.') }));
            return;
        }
        try {
            const updated = await resubmitLicense(id, payload);
            setLicenses(prev => prev.map(l => l.id === id ? { ...l, ...updated } : l));
            setSubmitSuccess(prev => ({ ...prev, [id]: t('myLicenses.resubmitSuccess', 'Application resubmitted successfully. It is now pending admin review.') }));
            setSubmitError(prev => ({ ...prev, [id]: '' }));
        } catch (e: any) {
            setSubmitError(prev => ({ ...prev, [id]: e.response?.data?.message || t('myLicenses.resubmitFailed', 'Resubmission failed') }));
        }
    };

    return (
        <DashboardLayout title={t('myLicenses.title', 'My License Applications')}>
            <div style={{ animation: 'fadeIn var(--transition-base)' }}>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                    {t('myLicenses.subtitle', 'Track the status of your license applications. If a modification is requested, you can edit and resubmit below.')}
                </p>

                {isLoading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
                        {t('myLicenses.loading', 'Loading applications...')}
                    </div>
                )}

                {error && (
                    <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid #ef4444', borderRadius: '4px', color: '#7f1d1d', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                {!isLoading && !error && licenses.length === 0 && (
                    <div className="framed-section" style={{ padding: '2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
                        <h4 style={{ color: 'var(--color-burnt-umber)', marginBottom: '0.5rem' }}>{t('myLicenses.noApplications', 'No Applications Yet')}</h4>
                        <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                            {t('myLicenses.gotoMarketplace', 'Go to the Marketplace to find cultural assets and apply for a license.')}
                        </p>
                        <a href="/marketplace" className="primary-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                            {t('myLicenses.browseMarketplace', 'Browse Marketplace →')}
                        </a>
                    </div>
                )}

                <div className="audio-list">
                    {licenses.map(license => {
                        const asset = typeof license.assetId === 'object' ? license.assetId : null;
                        const isModRequired = license.status === 'MODIFICATION_REQUIRED';

                        return (
                            <div key={license.id} className="framed-section" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div>
                                        <h4 style={{ margin: 0, marginBottom: '0.25rem' }}>
                                            {asset?.title || t('common.culturalAsset', 'Cultural Asset')}
                                        </h4>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                                            {asset?.communityName} • {license.licenseType} {t('common.license', 'License')} •{' '}
                                            {t('myLicenses.applied', 'Applied:')} {new Date(license.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <StatusBadge status={license.status} />
                                </div>

                                {/* Purpose */}
                                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--color-muted-gold)', borderRadius: '2px' }}>
                                    <strong style={{ fontSize: '0.85rem' }}>{t('myLicenses.purpose', 'Purpose:')}</strong>
                                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>{license.purpose}</p>
                                </div>

                                {/* Media access */}
                                <div style={{ marginTop: '1rem' }}>
                                    {license.status === 'APPROVED' && (asset as any)?.mediaUrl ? (
                                        <div style={{ padding: '1rem', background: 'rgba(34,197,94,0.05)', border: '1px solid #22c55e', borderRadius: '4px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#14532d', margin: 0 }}>
                                                    🔓 {t('myLicenses.fullMediaAccessGranted', 'Full Media Access Granted')}
                                                </p>
                                                <a
                                                    href={(asset as any).mediaUrl}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        fontSize: '0.78rem',
                                                        padding: '4px 14px',
                                                        background: '#14532d',
                                                        color: '#fff',
                                                        borderRadius: '4px',
                                                        textDecoration: 'none',
                                                        fontWeight: 700,
                                                        letterSpacing: '0.03em',
                                                    }}
                                                >
                                                    ⬇ {t('myLicenses.downloadFullFile', 'Download Full File')}
                                                </a>
                                            </div>
                                            <RoleMediaPlayer
                                                src={(asset as any).mediaUrl}
                                                mode="full"
                                                label={(asset as any).type === 'SONIC' ? `🎵 ${t('myLicenses.licensedSonicAsset', 'Licensed Sonic Asset')}` : `🎙 ${t('myLicenses.licensedVoiceRecording', 'Licensed Voice Recording')}`}
                                            />
                                        </div>
                                    ) : license.status !== 'APPROVED' ? (
                                        <div style={{ padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.03)', border: '1px dashed var(--color-muted-gold)', borderRadius: '4px', textAlign: 'center' }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                                                🔒 {t('myLicenses.mediaAccessUnlocksAfterApproval', 'Media access unlocks after license approval')}
                                            </span>
                                        </div>
                                    ) : null}
                                </div>

                                {/* Approved: agreement */}
                                {license.status === 'APPROVED' && license.agreementText && (
                                    <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.06)', border: '1px solid #22c55e', borderRadius: '4px' }}>
                                        <strong style={{ fontSize: '0.85rem', color: '#14532d' }}>📜 {t('myLicenses.licenseAgreementIssued', 'License Agreement Issued:')}</strong>
                                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{license.agreementText}</p>
                                    </div>
                                )}

                                {/* Rejected */}
                                {license.status === 'REJECTED' && license.adminComment && (
                                    <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.06)', border: '1px solid #ef4444', borderRadius: '4px' }}>
                                        <strong style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>{t('myLicenses.rejectionReason', 'Rejection Reason:')}</strong>
                                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>{license.adminComment}</p>
                                    </div>
                                )}

                                {/* Modification required */}
                                {isModRequired && (
                                    <>
                                        {license.adminComment && (
                                            <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(59,130,246,0.06)', border: '1px solid #3b82f6', borderRadius: '4px' }}>
                                                <strong style={{ fontSize: '0.85rem', color: '#1e3a5f' }}>{t('myLicenses.modificationRequested', 'Modification Requested by Admin:')}</strong>
                                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>{license.adminComment}</p>
                                            </div>
                                        )}
                                        <div style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'rgba(59,130,246,0.04)', border: '1px dashed #3b82f6', borderRadius: '4px' }}>
                                            <h5 style={{ margin: '0 0 1rem', color: '#1e3a5f' }}>✏️ {t('myLicenses.editResubmit', 'Edit & Resubmit Application')}</h5>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                                                {t('myLicenses.updatedPurpose', 'Updated Purpose')} <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <textarea
                                                placeholder={t('myLicenses.updatedPurposePlaceholder', 'Describe the updated purpose of your license application...')}
                                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #3b82f6', borderRadius: '2px', marginBottom: '0.75rem', minHeight: '80px' }}
                                                defaultValue={license.purpose}
                                                onChange={e => setResubmitData(prev => ({ ...prev, [license.id]: { ...prev[license.id], purpose: e.target.value } }))}
                                            />
                                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                                                {t('myLicenses.updatedDocumentation', 'Updated Documentation')}
                                            </label>
                                            <textarea
                                                placeholder={t('myLicenses.updatedDocumentationPlaceholder', 'Link or description of supporting documentation...')}
                                                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-muted-gold)', borderRadius: '2px', marginBottom: '1rem', minHeight: '60px' }}
                                                defaultValue={license.documentation || ''}
                                                onChange={e => setResubmitData(prev => ({ ...prev, [license.id]: { ...prev[license.id], documentation: e.target.value } }))}
                                            />
                                            {submitError[license.id] && (
                                                <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.5rem' }}>⚠ {submitError[license.id]}</p>
                                            )}
                                            {submitSuccess[license.id] && (
                                                <p style={{ color: '#14532d', fontSize: '0.85rem', marginBottom: '0.5rem' }}>✅ {submitSuccess[license.id]}</p>
                                            )}
                                            <button className="primary-btn" onClick={() => handleResubmit(license.id)}>
                                                {t('myLicenses.resubmitBtn', 'Resubmit Application')}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
};
