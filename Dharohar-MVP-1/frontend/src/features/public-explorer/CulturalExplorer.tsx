import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { CommunityDossier } from './CommunityDossier';
import { mockCommunities } from '../../data/mockData';
import { getPublicAssets } from '../../services/assetService';
import type { Asset } from '../../services/assetService';
import { RoleMediaPlayer } from '../../components/RoleMediaPlayer';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/Navigation/LanguageSwitcher';
import { HowItWorks } from './HowItWorks';
import './CulturalExplorer.css';

const PAGE_SIZE = 8;

const AttributionBlock = ({ text }: { text: string }) => {
    const { t } = useTranslation();
    const parts = text.split('\n');
    return (
        <div className="attribution-block">
            {parts.map((part, index) => (
                <span key={index}>{part}</span>
            ))}
            <strong>{t('marketplace.licenseRequired', 'License Required for: Commercial / Research / Media Use')}</strong>
        </div>
    );
};

export const CulturalExplorer = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();
    const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);

    // Video hero audio state
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const toggleAudio = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    // Paginated asset state
    const [approvedAssets, setApprovedAssets] = useState<Asset[]>([]);
    const [assetsLoading, setAssetsLoading] = useState(true);
    const [assetPage, setAssetPage] = useState(1);
    const [hasMoreAssets, setHasMoreAssets] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    // Sentinel refs for BIO + SONIC sections
    const bioSentinelRef = useRef<HTMLDivElement>(null);
    const sonicSentinelRef = useRef<HTMLDivElement>(null);
    const bioObserverRef = useRef<IntersectionObserver | null>(null);
    const sonicObserverRef = useRef<IntersectionObserver | null>(null);


    const fetchPage = useCallback(async (pageNum: number) => {
        if (pageNum === 1) setAssetsLoading(true);
        else setIsFetchingMore(true);
        try {
            const result = await getPublicAssets(pageNum, PAGE_SIZE);
            setApprovedAssets(prev => pageNum === 1 ? result.assets : [...prev, ...result.assets]);
            setHasMoreAssets(result.hasMore);
        } catch {
            // silently fail — page still works with mock communities
        } finally {
            setAssetsLoading(false);
            setIsFetchingMore(false);
        }
    }, []);

    // Initial load
    useEffect(() => { fetchPage(1); }, [fetchPage]);

    // Wire IntersectionObserver to BIO sentinel
    useEffect(() => {
        bioObserverRef.current?.disconnect();
        bioObserverRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMoreAssets && !isFetchingMore && !assetsLoading) {
                const next = assetPage + 1;
                setAssetPage(next);
                fetchPage(next);
            }
        }, { rootMargin: '200px' });
        if (bioSentinelRef.current) bioObserverRef.current.observe(bioSentinelRef.current);
        return () => bioObserverRef.current?.disconnect();
    }, [hasMoreAssets, isFetchingMore, assetsLoading, assetPage, fetchPage]);

    // SONIC sentinel mirrors same logic
    useEffect(() => {
        sonicObserverRef.current?.disconnect();
        sonicObserverRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMoreAssets && !isFetchingMore && !assetsLoading) {
                const next = assetPage + 1;
                setAssetPage(next);
                fetchPage(next);
            }
        }, { rootMargin: '200px' });
        if (sonicSentinelRef.current) sonicObserverRef.current.observe(sonicSentinelRef.current);
        return () => sonicObserverRef.current?.disconnect();
    }, [hasMoreAssets, isFetchingMore, assetsLoading, assetPage, fetchPage]);

    const selectedCommunity = mockCommunities.find(c => c.id === selectedCommunityId);

    const bioAssets = approvedAssets.filter(a => a.type === 'BIO');
    const sonicAssets = approvedAssets.filter(a => a.type === 'SONIC');

    return (
        <div style={{ backgroundColor: 'var(--color-parchment)', minHeight: '100vh' }}>

            {/* ═══════════════ SECTION 1 — Video Hero ═══════════════ */}
            <section style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
                {/* ── Top Navigation Bar ── */}
                <header style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    padding: '1.5rem 2rem',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    zIndex: 50,
                    background: 'linear-gradient(to bottom, rgba(10,6,3,0.7) 0%, rgba(10,6,3,0) 100%)'
                }}>
                    <LanguageSwitcher variant="dark" />
                </header>
                {/* Background video */}
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 0
                    }}
                >
                    <source src="/homepage_video.mp4" type="video/mp4" />
                </video>

                {/* Dark gradient overlay — bottom to top for text contrast */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(10,6,3,0.55) 0%, rgba(10,6,3,0.30) 50%, rgba(10,6,3,0.75) 100%)',
                    zIndex: 1
                }} />

                {/* ── Centered Brand Block ── */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '0 2rem'
                }}>
                    <p style={{
                        color: 'var(--color-muted-gold)',
                        fontSize: '0.85rem',
                        letterSpacing: '0.35em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 600,
                        marginBottom: '1.25rem',
                        opacity: 0.9
                    }}>{t('explorer.tagline', "India's Digital Cultural Archive")}</p>

                    <h1 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(4rem, 10vw, 9rem)',
                        fontWeight: 700,
                        color: '#F5EDD8',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        lineHeight: 1,
                        margin: 0,
                        textShadow: '0 4px 24px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.8)'
                    }}>{t('explorer.dharohar', 'DHAROHAR')}</h1>

                    <div style={{
                        width: '80px',
                        height: '2px',
                        background: 'var(--color-muted-gold)',
                        margin: '1.75rem auto'
                    }} />

                    <p style={{
                        color: '#E8DCC8',
                        fontSize: 'clamp(1rem, 2.5vw, 1.35rem)',
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        letterSpacing: '0.03em',
                        maxWidth: '620px',
                        lineHeight: 1.6,
                        textShadow: '0 2px 12px rgba(0,0,0,0.6)'
                    }}>{t('explorer.subtitle', "Safeguarding India's Wisdom with Digital Sovereignty")}</p>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                            className="primary-btn"
                            style={{ padding: '0.85rem 2.5rem', fontSize: '0.95rem', letterSpacing: '0.05em' }}
                            onClick={() => navigate(user ? '/dashboard' : '/login')}
                        >
                            {user ? t('explorer.goToDashboard', 'Go to Dashboard') : t('explorer.enterPlatform', 'Enter Platform')}
                        </button>
                        <button
                            className="minimal-btn"
                            style={{
                                padding: '0.85rem 2.5rem',
                                fontSize: '0.95rem',
                                letterSpacing: '0.05em',
                                color: '#F5EDD8',
                                borderColor: 'rgba(245,237,216,0.5)',
                                backgroundColor: 'transparent'
                            }}
                            onClick={() => navigate('/marketplace')}
                        >
                            {t('explorer.browseArchives', 'Browse Archives')}
                        </button>
                    </div>

                    {!user && (
                        <p style={{ marginTop: '2rem', fontSize: '0.82rem', color: 'rgba(245,237,216,0.6)', fontFamily: 'var(--font-sans)' }}>
                            {t('explorer.newToApp', 'New to the platform?')} <a href="/register" style={{ color: 'var(--color-muted-gold)', fontWeight: 600, textDecoration: 'underline' }}>{t('explorer.applyForAccess', 'Apply for Access')}</a>
                        </p>
                    )}
                </div>

                {/* ── Audio Control ── */}
                <button
                    onClick={toggleAudio}
                    style={{
                        position: 'absolute',
                        bottom: '2rem',
                        right: '2rem',
                        zIndex: 3,
                        background: 'rgba(10,6,3,0.5)',
                        border: '1px solid rgba(245,237,216,0.3)',
                        color: '#F5EDD8',
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(10,6,3,0.8)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(10,6,3,0.5)'}
                    title={isMuted ? "Unmute audio" : "Mute audio"}
                >
                    {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
                </button>

                {/* ── Scroll indicator ── */}
                <div style={{
                    position: 'absolute',
                    bottom: '2.5rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'rgba(245,237,216,0.5)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase'
                }}>
                    <span>{t('explorer.scroll', 'Scroll')}</span>
                    <div style={{
                        width: '1px',
                        height: '48px',
                        background: 'linear-gradient(to bottom, rgba(245,237,216,0.5), transparent)',
                        animation: 'pulse 2s ease-in-out infinite'
                    }} />
                </div>
            </section>

            <main className="explorer-container">

                {/* SECTION 2 - Introduction Banner */}
                <section className="section-banner">
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{t('explorer.introHeading', 'Preserving and Licensing Indigenous Knowledge through Structured Governance')}</h2>
                    <div className="decorative-divider"><span className="diamond"></span></div>
                </section>

                {/* SECTION 3 - Featured Communities Grid */}
                <section style={{ marginBottom: '6rem' }}>
                    <h3 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>{t('explorer.featuredCommunities', 'Featured Communities')}</h3>
                    <div className="grid-layout">
                        {mockCommunities.map(community => (
                            <div
                                key={community.id}
                                id={`community-card-${community.id}`}
                                className="structured-card interactive-card"
                                onClick={() => setSelectedCommunityId(community.id)}
                            >
                                <div className="card-header">
                                    <h4 className="card-title">{t(`communities.${community.id}.name`, community.name)}</h4>
                                </div>
                                <h5 className="card-subtitle">{t(`communities.${community.id}.region`, community.region)}</h5>

                                {community.image && (
                                    <div style={{ width: '100%', height: '160px', overflow: 'hidden', borderRadius: '2px', marginBottom: '1rem' }}>
                                        <img src={community.image} alt={community.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}

                                <p className="card-desc">{t(`communities.${community.id}.culturalIdentity`, community.culturalIdentity)}</p>

                                <button
                                    className="minimal-btn"
                                    style={{ width: '100%' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                        navigate(`/community/${community.id}`);
                                    }}
                                >
                                    {t('explorer.viewFullDossier', 'View Full Dossier')}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 4 - How Dharohar Works */}
                <HowItWorks />

                {/* SECTION 5 - Live Approved BIO Knowledge */}
                <section style={{ marginBottom: '6rem' }}>
                    <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>{t('explorer.knowledgeArchives', 'Knowledge Archives')}</h3>
                    <p style={{ textAlign: 'center', color: 'var(--color-text-light)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                        {t('explorer.knowledgeSubtitle', 'Showing community-approved biological knowledge assets')}
                    </p>
                    {assetsLoading ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-light)' }}>{t('explorer.loadingArchives', 'Loading approved archives...')}</p>
                    ) : bioAssets.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-light)' }}>{t('explorer.noBioAssets', 'No approved biological assets yet.')}</p>
                    ) : (
                        <div className="grid-layout">
                            {bioAssets.map(asset => (
                                <div key={asset.id} className="structured-card">
                                    <div className="card-header">
                                        <h4 className="card-title">{asset.title}</h4>
                                        <span className="card-badge">{t(`common.risk${asset.riskTier ? asset.riskTier.charAt(0).toUpperCase() + asset.riskTier.slice(1).toLowerCase() : 'Low'}`, `${asset.riskTier || 'LOW'} RISK`)}</span>
                                    </div>
                                    <h5 className="card-subtitle">{asset.communityName}</h5>
                                    <p className="card-desc">{asset.description}</p>

                                    {asset.mediaUrl ? (
                                        <div style={{ margin: '1rem 0' }}>
                                            <RoleMediaPlayer
                                                src={asset.mediaUrl}
                                                mode="preview"
                                                assetId={asset.id}
                                                assetType={asset.type}
                                                previewSeconds={30}
                                                label={`🎵 ${t('explorer.voicePreview', 'Voice Recording Preview')}`}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ margin: '1rem 0', padding: '0.75rem', background: 'var(--color-bg-light)', border: '1px dashed var(--color-muted-gold)', borderRadius: '2px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--color-text-light)' }}>
                                            📄 {t('explorer.textRecord', 'Text-based knowledge record')}
                                        </div>
                                    )}

                                    <button className="minimal-btn" onClick={() => navigate('/marketplace')} style={{ width: '100%' }}>
                                        {t('explorer.applyForLicense', 'Apply for License')}
                                    </button>
                                    <AttributionBlock text={asset.recordeeName || asset.communityName} />
                                </div>
                            ))}
                        </div>
                    )}
                    {/* BIO sentinel */}
                    <div ref={bioSentinelRef} style={{ height: '1px' }} aria-hidden="true" />
                    {isFetchingMore && <p style={{ textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>{t('explorer.loadingMore', 'Loading more archives...')}</p>}
                </section>

                {/* SECTION 5 - Live Approved SONIC Assets */}
                <section style={{ marginBottom: '4rem' }}>
                    <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>{t('explorer.sonicArchives', 'Sonic Archives')}</h3>
                    <p style={{ textAlign: 'center', color: 'var(--color-text-light)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                        {t('explorer.sonicSubtitle', 'Showing community-approved musical and oral heritage assets')}
                    </p>
                    {assetsLoading ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-light)' }}>{t('explorer.loadingArchives', 'Loading approved archives...')}</p>
                    ) : sonicAssets.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-light)' }}>{t('explorer.noSonicAssets', 'No approved sonic assets yet.')}</p>
                    ) : (
                        <div className="grid-layout">
                            {sonicAssets.map(asset => (
                                <div key={asset.id} className="structured-card">
                                    <div className="card-header">
                                        <h4 className="card-title">{asset.title}</h4>
                                        <span className="card-badge">SONIC</span>
                                    </div>
                                    <h5 className="card-subtitle">{asset.communityName}</h5>
                                    <p className="card-desc">{asset.description}</p>

                                    {asset.mediaUrl ? (
                                        <div style={{ margin: '1rem 0' }}>
                                            <RoleMediaPlayer
                                                src={asset.mediaUrl}
                                                mode="preview"
                                                assetId={asset.mediaFileId}
                                                assetType={asset.type}
                                                previewSeconds={30}
                                                label={`🎵 ${t('explorer.sonicPreview', 'Sonic Preview (30s)')}`}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ margin: '1rem 0', padding: '0.75rem', background: 'var(--color-bg-light)', border: '1px dashed var(--color-muted-gold)', borderRadius: '2px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--color-text-light)' }}>
                                            🎶 {t('explorer.previewAvailable', 'Preview available after licensing')}
                                        </div>
                                    )}

                                    <button className="minimal-btn" onClick={() => navigate('/marketplace')} style={{ width: '100%' }}>
                                        {t('explorer.applyForMediaLicense', 'Apply for Media License')}
                                    </button>
                                    <AttributionBlock text={asset.recordeeName || asset.communityName} />
                                </div>
                            ))}
                        </div>
                    )}
                    {/* SONIC sentinel */}
                    <div ref={sonicSentinelRef} style={{ height: '1px' }} aria-hidden="true" />
                    {isFetchingMore && <p style={{ textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>{t('explorer.loadingMore', 'Loading more archives...')}</p>}
                </section>

            </main>

            {/* Community Modal */}
            {selectedCommunity && (
                <CommunityDossier
                    community={selectedCommunity}
                    isModal={true}
                    onClose={() => setSelectedCommunityId(null)}
                />
            )}
        </div>
    );
};
