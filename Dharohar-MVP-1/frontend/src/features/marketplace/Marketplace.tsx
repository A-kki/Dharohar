import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicAssets } from '../../services/assetService';
import type { Asset } from '../../services/assetService';
import { SkeletonCard } from '../../components/SkeletonLoader';
import { BackButton } from '../../components/Navigation/BackButton';
import { useAuth } from '../../features/auth/AuthContext';
import { LicensingInfoSection } from './LicensingInfoSection';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/Navigation/LanguageSwitcher';
import './Marketplace.css';

const PAGE_SIZE = 12;

const AttributionBlock = ({ text }: { text: string }) => {
    const { t } = useTranslation();
    const parts = (text || '').split('\n');
    return (
        <div className="attribution-block">
            {parts.map((part, index) => (
                <span key={index}>{part}</span>
            ))}
            <strong>{t('marketplace.licenseRequired', 'License Required for: Commercial / Research / Media Use')}</strong>
        </div>
    );
};

export const Marketplace = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();

    // True for logged-out users OR users with no governance role
    const isGeneralUser = !user || !(['community', 'review', 'admin'] as const).some(r => user.roles?.includes(r));

    // ── All loaded assets (accumulated across pages) ──────────────────
    const [assets, setAssets] = useState<Asset[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Filter / sort (applied client-side on accumulated data) ───────
    const [filterType, setFilterType] = useState('ALL');
    const [filterRisk, setFilterRisk] = useState('ALL');
    const [sortBy, setSortBy] = useState('COMMUNITY');
    const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);

    // ── Sentinel ref for IntersectionObserver ─────────────────────────
    const sentinelRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const handleApply = (asset: Asset, licenseType?: string) => {
        if (!user) { navigate('/login'); return; }
        const mediaUrlParam = asset.mediaUrl ? `&mediaUrl=${encodeURIComponent(asset.mediaUrl)}` : '';
        const mediaFileIdParam = asset.mediaFileId ? `&mediaFileId=${encodeURIComponent(asset.mediaFileId)}` : '';
        navigate(`/apply/${asset.id}?assetType=${asset.type}&title=${encodeURIComponent(asset.title)}&lt=${licenseType || ''}${mediaUrlParam}${mediaFileIdParam}`);
    };

    const toggleLicensingSection = (assetId: string) => {
        setExpandedAssetId(prev => (prev === assetId ? null : assetId));
    };

    // ── Fetch a single page ───────────────────────────────────────────
    const fetchPage = useCallback(async (pageNum: number) => {
        if (pageNum === 1) setIsLoading(true);
        else setIsFetchingMore(true);
        try {
            const result = await getPublicAssets(pageNum, PAGE_SIZE);
            setAssets(prev => pageNum === 1 ? result.assets : [...prev, ...result.assets]);
            setHasMore(result.hasMore);
        } catch (e: any) {
            setError(e.response?.data?.message || t('marketplace.loadError', 'Failed to load marketplace.'));
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    }, [t]);

    // Initial load
    useEffect(() => { fetchPage(1); }, [fetchPage]);

    // ── Wire IntersectionObserver to sentinel ─────────────────────────
    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isLoading) {
                const next = page + 1;
                setPage(next);
                fetchPage(next);
            }
        }, { rootMargin: '200px' });

        if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
        return () => observerRef.current?.disconnect();
    }, [hasMore, isFetchingMore, isLoading, page, fetchPage]);

    // ── Client-side filter + sort ─────────────────────────────────────
    const displayedAssets = assets
        .filter(a => filterType === 'ALL' || a.type === filterType)
        .filter(a => filterRisk === 'ALL' || a.riskTier === filterRisk)
        .sort((a, b) => {
            if (sortBy === 'COMMUNITY') return a.communityName.localeCompare(b.communityName);
            if (sortBy === 'RISK') {
                const riskOrder: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
                return (riskOrder[a.riskTier || 'LOW'] || 1) - (riskOrder[b.riskTier || 'LOW'] || 1);
            }
            return 0;
        });

    return (
        <div style={{ backgroundColor: 'var(--color-parchment)', minHeight: '100vh', padding: '4rem 2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1.5rem', right: '2rem', zIndex: 10 }}>
                <LanguageSwitcher />
            </div>
            <div className="marketplace-container">
                <BackButton />
                <header className="marketplace-header section-banner">
                    <h2>{t('marketplace.title', 'Cultural Asset Marketplace')}</h2>
                    <p>{t('marketplace.subtitle', 'Structured licensing for verified indigenous knowledge and media. Only community-approved assets are listed here.')}</p>
                </header>

                {error && (
                    <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid #ef4444', borderRadius: '4px', color: '#7f1d1d', marginBottom: '1.5rem' }}>
                        {error}
                    </div>
                )}

                <div className="marketplace-layout">
                    <aside className="filters-sidebar framed-section">
                        <h3>{t('marketplace.filterKnowledge', 'Filter Knowledge')}</h3>
                        <div className="filter-group">
                            <label>{t('marketplace.assetType', 'Asset Type')}</label>
                            <select value={filterType} onChange={e => { setFilterType(e.target.value); }}>
                                <option value="ALL">{t('marketplace.allTypes', 'All Types')}</option>
                                <option value="BIO">{t('marketplace.bioType', 'Biological Knowledge')}</option>
                                <option value="SONIC">{t('marketplace.sonicType', 'Sonic / Musical')}</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>{t('marketplace.riskTier', 'Risk Tier')}</label>
                            <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}>
                                <option value="ALL">{t('marketplace.allRiskTiers', 'All Risk Tiers')}</option>
                                <option value="LOW">{t('marketplace.lowRisk', 'Low Risk')}</option>
                                <option value="MEDIUM">{t('marketplace.mediumRisk', 'Medium Risk')}</option>
                                <option value="HIGH">{t('marketplace.highRisk', 'High Risk')}</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>{t('marketplace.sortBy', 'Sort By')}</label>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                <option value="COMMUNITY">{t('marketplace.sortCommunity', 'Community Name')}</option>
                                <option value="RISK">{t('marketplace.riskTier', 'Risk Tier')}</option>
                            </select>
                        </div>
                    </aside>

                    <main className="marketplace-main">
                        <div className="marketplace-summary">
                            <span>{t('marketplace.showingAssets', { count: displayedAssets.length, defaultValue: `Showing ${displayedAssets.length} governed assets` })}</span>
                        </div>

                        <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                            ) : displayedAssets.length === 0 ? (
                                <div className="no-data" style={{ gridColumn: '1 / -1' }}>
                                    {assets.length === 0
                                        ? t('marketplace.noApprovedAssets', 'No approved assets in the marketplace yet. Assets appear here after community review approval.')
                                        : t('marketplace.noMatchAssets', 'No assets match the current filters.')}
                                </div>
                            ) : (
                                displayedAssets.map(asset => {
                                    const isLicensingOpen = expandedAssetId === asset.id;
                                    return (
                                        <div key={asset.id} className="structured-card" style={{ animation: 'fadeIn var(--transition-base)' }}>
                                            <div className="card-header">
                                                <h4 className="card-title">{asset.title}</h4>
                                                <span className="card-badge">{asset.type}</span>
                                            </div>
                                            <h5 className="card-subtitle">{asset.communityName}</h5>

                                            <div className="badges-row">
                                                {asset.riskTier && (
                                                    <span className={`status tag ${asset.riskTier.toLowerCase()}`}>{t(`common.risk${asset.riskTier ? asset.riskTier.charAt(0).toUpperCase() + asset.riskTier.slice(1).toLowerCase() : 'Low'}`, `${asset.riskTier} RISK`)}</span>
                                                )}
                                            </div>

                                            <p className="card-desc">{asset.description}</p>

                                            {asset.mediaUrl && (
                                                <div style={{ margin: '1rem 0', padding: '0.75rem', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--color-muted-gold)', borderRadius: '2px' }}>
                                                    <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-light)' }}>
                                                        {asset.type === 'SONIC' ? `🎵 ${t('marketplace.sonicPreview', '30s Preview')}` : `🎙 ${t('marketplace.voiceSample', 'Voice Sample')}`}
                                                    </p>
                                                    {asset.mediaUrl.match(/\.(mp4|webm|mov)$/i) ? (
                                                        <video controls preload="metadata" style={{ width: '100%', borderRadius: '2px', maxHeight: '180px' }} src={asset.mediaUrl} />
                                                    ) : (
                                                        <audio controls preload="metadata" style={{ width: '100%' }} src={asset.mediaUrl} />
                                                    )}

                                                    {/* ── Public Restriction Notice (general users only) ── */}
                                                    {isGeneralUser && (
                                                        <div className="public-restriction-notice">
                                                            <p className="restriction-text">
                                                                ⚠️ {t('marketplace.restrictionNotice', 'This cultural archive is protected under indigenous heritage law. You may not commercially use, reproduce, or publish this material under your name. Please review licensing details for authorised usage.')}
                                                            </p>
                                                            <button
                                                                type="button"
                                                                className="restriction-license-btn"
                                                                onClick={() => toggleLicensingSection(asset.id)}
                                                            >
                                                                {expandedAssetId === asset.id ? `▲ ${t('marketplace.hideTerms', 'Hide Licensing Terms')}` : `📋 ${t('marketplace.viewTerms', 'View Licensing Terms')}`}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* ── Quick Apply Buttons ── */}
                                            <div className="marketplace-action">
                                                {asset.type === 'BIO' ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                                                        <button className="minimal-btn" style={{ width: '100%' }} onClick={() => handleApply(asset, 'RESEARCH')}>{t('marketplace.applyResearch', 'Apply for Research License')}</button>
                                                        <button className="primary-btn" style={{ width: '100%' }} onClick={() => handleApply(asset, 'COMMERCIAL')}>{t('marketplace.applyCommercial', 'Apply for Commercial License')}</button>
                                                    </div>
                                                ) : (
                                                    <div style={{ width: '100%' }}>
                                                        <div className="fee-structure" style={{ marginBottom: '0.5rem' }}>
                                                            <span>{t('marketplace.licensingFee', 'Licensing Fee')}</span>
                                                            <strong>{t('marketplace.tieredGovernance', 'Tiered Governance')}</strong>
                                                        </div>
                                                        <button className="primary-btn" style={{ width: '100%' }} onClick={() => handleApply(asset, 'MEDIA')}>{t('marketplace.applyMedia', 'Apply for Media License')}</button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* ── View Licensing Info Toggle ── */}
                                            <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                                                <button
                                                    type="button"
                                                    className="lis-toggle-btn"
                                                    onClick={() => toggleLicensingSection(asset.id)}
                                                    aria-expanded={isLicensingOpen}
                                                >
                                                    {isLicensingOpen ? `▲ ${t('marketplace.hideDetails', 'Hide Licensing Details')}` : `▼ ${t('marketplace.viewDetails', 'View Licensing Options & Fees')}`}
                                                </button>
                                            </div>

                                            {isLicensingOpen && (
                                                <LicensingInfoSection
                                                    assetType={asset.type as 'BIO' | 'SONIC'}
                                                    onApply={(lt) => handleApply(asset, lt)}
                                                />
                                            )}

                                            <AttributionBlock text={asset.recordeeName || asset.communityName} />
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* ── Infinite scroll: loading skeleton row ── */}
                        {isFetchingMore && (
                            <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', marginTop: '1.5rem' }}>
                                {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={`more-${i}`} />)}
                            </div>
                        )}

                        {/* ── Sentinel: IntersectionObserver target ── */}
                        <div ref={sentinelRef} style={{ height: '1px', marginTop: '2rem' }} aria-hidden="true" />

                        {/* ── End of list message ── */}
                        {!hasMore && assets.length > 0 && (
                            <p style={{ textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.85rem', marginTop: '1.5rem', fontStyle: 'italic' }}>
                                {t('marketplace.allAssetsLoaded', { count: assets.length, defaultValue: `All ${assets.length} assets loaded.` })}
                            </p>
                        )}
                    </main>
                </div>

                {/* General Licensing Guide (empty state) */}
                {!isLoading && assets.length === 0 && (
                    <div style={{ marginTop: '4rem' }}>
                        <hr style={{ borderColor: 'var(--color-muted-gold)', marginBottom: '3rem' }} />
                        <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burnt-umber)', fontSize: '1.75rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                            {t('marketplace.understandingFramework', 'Understanding Our Licensing Framework')}
                        </h3>
                        <p style={{ textAlign: 'center', color: 'var(--color-text-light)', marginBottom: '2.5rem' }}>
                            {t('marketplace.browseLicenseTypes', 'Browse the license types available on this platform before assets are approved.')}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <h4 style={{ color: 'var(--color-burnt-umber)', marginBottom: '1rem' }}>{t('marketplace.bioHeader', '🌿 Biological Knowledge (BIO)')}</h4>
                                <LicensingInfoSection assetType="BIO" onApply={() => navigate('/login')} />
                            </div>
                            <div>
                                <h4 style={{ color: 'var(--color-burnt-umber)', marginBottom: '1rem' }}>{t('marketplace.sonicHeader', '🎶 Sonic Heritage (SONIC)')}</h4>
                                <LicensingInfoSection assetType="SONIC" onApply={() => navigate('/login')} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
