import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { getAllLicenses } from '../../services/licenseService';
import type { License } from '../../services/licenseService';
import { useTranslation } from 'react-i18next';

export const LicenseHistory = () => {
    const { t } = useTranslation();
    const [licenses, setLicenses] = useState<License[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'REJECTED' | 'MODIFICATION_REQUIRED'>('ALL');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getAllLicenses();
                setLicenses(data);
            } catch (e: any) {
                setError(e.response?.data?.message || t('licenseHistory.loadFailed', 'Failed to load license history.'));
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const displayed = licenses
        .filter(l => filter === 'ALL' || l.status === filter)
        .filter(l => {
            if (!search) return true;
            const asset = typeof l.assetId === 'object' ? l.assetId : null;
            const applicant = typeof l.applicantId === 'object' ? l.applicantId : null;
            const q = search.toLowerCase();
            return (
                asset?.title?.toLowerCase().includes(q) ||
                asset?.communityName?.toLowerCase().includes(q) ||
                applicant?.name?.toLowerCase().includes(q) ||
                applicant?.email?.toLowerCase().includes(q)
            );
        });

    const countByStatus = (s: string) => licenses.filter(l => l.status === s).length;

    return (
        <DashboardLayout title={t('licenseHistory.title', 'License History')}>
            <div style={{ animation: 'fadeIn var(--transition-base)' }}>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
                    {t('licenseHistory.subtitle', 'All license applications ever processed — approved, rejected, and those awaiting modification.')}
                </p>

                {/* Summary strip */}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    {[
                        { label: t('licenseHistory.totalApplications', 'Total Applications'), value: licenses.length, color: 'var(--color-text-main)' },
                        { label: t('licenseHistory.approved', 'Approved'), value: countByStatus('APPROVED'), color: '#14532d' },
                        { label: t('licenseHistory.rejected', 'Rejected'), value: countByStatus('REJECTED'), color: '#7f1d1d' },
                        { label: t('licenseHistory.pending', 'Pending'), value: countByStatus('PENDING'), color: '#b45309' },
                        { label: t('licenseHistory.modificationReq', 'Modification Req.'), value: countByStatus('MODIFICATION_REQUIRED'), color: '#1e3a5f' },
                    ].map(s => (
                        <div key={s.label} style={{ padding: '1rem 1.25rem', border: '1px solid var(--color-muted-gold)', borderRadius: '2px', minWidth: '120px', textAlign: 'center', background: 'var(--color-bg-light)' }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-light)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
                    {(['ALL', 'APPROVED', 'REJECTED', 'PENDING', 'MODIFICATION_REQUIRED'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={(filter as string) === f ? 'primary-btn' : 'minimal-btn'}
                            style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
                        >
                            {f === 'ALL' ? t('common.all', 'All') : f === 'MODIFICATION_REQUIRED' ? t('licenseHistory.modReqShort', 'Mod. Req.') : t(`common.${f.toLowerCase()}`, f.charAt(0) + f.slice(1).toLowerCase())}
                        </button>
                    ))}
                    <input
                        type="text"
                        placeholder={t('licenseHistory.searchPlaceholder', 'Search by asset, community, or applicant...')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--color-muted-gold)', borderRadius: '2px', fontSize: '0.875rem', flex: 1, minWidth: '220px', background: 'white' }}
                    />
                </div>

                {isLoading && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>{t('licenseHistory.loading', 'Loading license history...')}</div>}
                {error && <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid #ef4444', borderRadius: '4px', color: '#7f1d1d' }}>{error}</div>}

                {!isLoading && !error && displayed.length === 0 && (
                    <div className="no-data">
                        {licenses.length === 0 ? t('licenseHistory.noApplications', 'No license applications in the system yet.') : t('licenseHistory.noMatch', 'No applications match the current filter.')}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {displayed.map(license => {
                        const asset = typeof license.assetId === 'object' ? license.assetId : null;
                        const applicant = typeof license.applicantId === 'object' ? license.applicantId : null;

                        return (
                            <div key={license.id} className="framed-section" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    <div>
                                        <h4 style={{ margin: 0, marginBottom: '0.2rem' }}>{asset?.title || t('common.culturalAsset', 'Cultural Asset')}</h4>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                                            {asset?.communityName} · {license.licenseType} {t('common.licenseUpper', 'LICENSE')}
                                            {applicant && ` · ${applicant.name} (${applicant.email})`}
                                            {' · '}
                                            {new Date(license.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <StatusBadge status={license.status} />
                                </div>

                                {/* Purpose */}
                                <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--color-muted-gold)', borderRadius: '2px', fontSize: '0.875rem' }}>
                                    <strong>{t('licenseHistory.purpose', 'Purpose:')}</strong> {license.purpose}
                                </div>

                                {/* Asset media */}
                                {(asset as any)?.mediaUrl && (
                                    <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--color-muted-gold)', borderRadius: '2px' }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: '0.4rem' }}>{t('licenseHistory.assetMedia', 'Asset Media:')}</p>
                                        {(asset as any).mediaUrl.match(/\.(mp4|webm|ogv)$/i)
                                            ? <video controls style={{ width: '100%', maxHeight: '150px' }} src={(asset as any).mediaUrl} />
                                            : <audio controls style={{ width: '100%' }} src={(asset as any).mediaUrl} />
                                        }
                                    </div>
                                )}

                                {/* Admin comment */}
                                {license.adminComment && (
                                    <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: license.status === 'APPROVED' ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)', border: `1px solid ${license.status === 'APPROVED' ? '#22c55e' : '#ef4444'}`, borderRadius: '4px', fontSize: '0.85rem' }}>
                                        <strong style={{ color: license.status === 'APPROVED' ? '#14532d' : '#7f1d1d' }}>{t('licenseHistory.adminNote', 'Admin Note:')}</strong>
                                        <p style={{ margin: '0.25rem 0 0' }}>{license.adminComment}</p>
                                    </div>
                                )}

                                {/* Agreement text for approved */}
                                {license.status === 'APPROVED' && license.agreementText && (
                                    <details style={{ marginTop: '0.75rem' }}>
                                        <summary style={{ fontSize: '0.85rem', cursor: 'pointer', color: '#14532d', fontWeight: 600 }}>📜 {t('licenseHistory.viewLicenseAgreement', 'View License Agreement')}</summary>
                                        <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(34,197,94,0.05)', border: '1px solid #22c55e', borderRadius: '4px', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                                            {license.agreementText}
                                        </div>
                                    </details>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
};
