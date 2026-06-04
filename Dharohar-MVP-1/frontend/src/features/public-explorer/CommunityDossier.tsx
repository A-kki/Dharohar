import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Community } from '../../data/mockData';
import heroImage from '../../assets/beautiful.png';
import { RoleMediaPlayer } from '../../components/RoleMediaPlayer';
import './CommunityDetail.css';

interface CommunityDossierProps {
    community: Community;
    isModal?: boolean;
    onClose?: () => void;
}

export const CommunityDossier: React.FC<CommunityDossierProps> = ({ community, isModal, onClose }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [modalData, setModalData] = useState<any | null>(null);

    const translatedName = t(`communities.${community.id}.name`, community.name);

    const content = (
        <div className={`community-dossier ${isModal ? 'modal-view' : ''}`}>
            {/* Header Section */}
            <header className="community-header" style={{ backgroundImage: `linear-gradient(rgba(244, 237, 228, 0.9), rgba(244, 237, 228, 0.95)), url(${community.coverImage || heroImage})` }}>
                <div className="header-content">
                    {isModal && <button className="close-btn" onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-burnt-umber)' }}>✕</button>}
                    <h1 className="hero-title" style={{ color: 'var(--color-burnt-umber)', textShadow: 'none', fontSize: isModal ? '2.5rem' : '3.5rem' }}>{translatedName}</h1>
                    <div className="decorative-divider"><span className="diamond"></span></div>
                    <div className="community-meta">
                        <span>{t(`communities.${community.id}.region`, community.region)}</span>
                        <span className="dot">•</span>
                        <span>{t(`communities.${community.id}.culturalIdentity`, community.culturalIdentity)}</span>
                    </div>
                    <p className="header-attribution">{t('dossier.attribution', 'Knowledge preserved and submitted by the {{name}} Council', { name: translatedName })}</p>
                </div>
            </header>

            <main className="explorer-container" style={{ paddingTop: '2rem' }}>
                <section className="dossier-section">
                    <div className="section-header">
                        <h2>{t('dossier.culturalOverview', 'Cultural Overview')}</h2>
                        <div className="governance-tags">
                            <span className="tag status" style={{ animation: 'badgePop var(--transition-base)' }}>{t('dossier.statusApproved', 'Governance Status: APPROVED')}</span>
                        </div>
                    </div>

                    <div className="overview-content framed-section">
                        <img src={community.image} alt={community.name} className="overview-image" />
                        <div className="overview-text">
                            {community.description.split('\n\n').map((para, i) => {
                                const colonIdx = para.indexOf(':');
                                if (colonIdx > 0 && colonIdx < 30) {
                                    return (
                                        <p key={i} style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                                            <strong style={{ color: 'var(--color-burnt-umber)' }}>{para.substring(0, colonIdx + 1)}</strong>
                                            {para.substring(colonIdx + 1)}
                                        </p>
                                    );
                                }
                                return <p key={i} style={{ marginBottom: '1rem', lineHeight: '1.6' }}>{para}</p>;
                            })}

                            {community.gallery && community.gallery.length > 0 && (
                                <div style={{ marginTop: '2rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {community.gallery.map((img, i) => (
                                        <img key={i} src={img} alt={`${community.name} gallery image`} style={{ flex: '1', minWidth: '200px', height: '200px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--color-muted-gold)', boxShadow: 'var(--shadow-soft)' }} />
                                    ))}
                                </div>
                            )}
                            <div className="knowledge-areas">
                                <strong>Core Knowledge Domains:</strong>
                                <ul>
                                    <li>Traditional medicinal practice</li>
                                    <li>Ritual and ceremonial structures</li>
                                    <li>Environmental & ecological knowledge</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="dossier-section">
                    <h2>Traditional Knowledge Archive</h2>
                    <div className="grid-layout">
                        {community.bioKnowledge.map(bk => (
                            <div key={bk.id} className="structured-card interactive-card" onClick={() => setModalData(bk)}>
                                <div className="card-header">
                                    <h4 className="card-title">{bk.title}</h4>
                                    <span className="card-badge">{bk.riskTier} RISK</span>
                                </div>
                                <h5 className="card-subtitle">{bk.licenseType.replace('_', ' ')}</h5>
                                <p className="card-desc">{bk.summary}</p>
                                <div className="click-indicator">View Complete Documentation →</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="dossier-section">
                    <h2>Folk Music Library</h2>
                    <div className="audio-list">
                        {community.music.map(track => (
                            <div key={track.id} className="audio-row framed-section flex-row-layout">
                                {/* Left Section: Player & Title */}
                                <div className="audio-left-section">
                                    <h4 className="audio-track-title">{track.title}</h4>
                                    <div className="player-placeholder">
                                        <RoleMediaPlayer
                                            src={track.audioFile}
                                            mode="full"
                                            label=""
                                        />
                                    </div>
                                </div>

                                {/* Center Section: Description & Notice */}
                                <div className="audio-center-section">
                                    <h5 className="audio-center-heading">Full Audio Archive</h5>
                                    <p className="audio-center-desc">
                                        {track.attribution.split('\n')[0]}<br />
                                        <span className="audio-center-preserved">{track.attribution.split('\n')[1] || `Preserved by the ${community.name} Community.`}</span>
                                    </p>
                                    <div className="audio-center-license-notice">
                                        <strong>License Required for:</strong> Commercial / Research / Media Use
                                    </div>
                                </div>

                                {/* Right Section: Action Button */}
                                <div className="audio-right-section">
                                    <button className="primary-btn" onClick={() => navigate('/marketplace')}>Apply for License</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                {community.videos && community.videos.length > 0 && (
                    <section className="dossier-section">
                        <h2>Documentary & Video Archives</h2>
                        <div className="grid-layout">
                            {community.videos.map(video => (
                                <div key={video.id} className="media-card structured-card">
                                    <h4 className="card-title" style={{ marginBottom: '1rem' }}>{video.title}</h4>

                                    {video.url ? (
                                        <div className="media-frame" style={{ height: '220px', borderRadius: '4px', overflow: 'hidden' }}>
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={video.url}
                                                title={video.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    ) : (
                                        <div className="media-frame" style={{ height: '220px', borderRadius: '4px', overflow: 'hidden' }}>
                                            <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div className="play-overlay">▶</div>
                                        </div>
                                    )}
                                    <p className="card-desc" style={{ marginTop: '1rem' }}>{video.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* Internal Detail Modal */}
            {modalData && (
                <div className="modal-backdrop" onClick={() => setModalData(null)} style={{ zIndex: 2000 }}>
                    <div className="modal-content framed-section" onClick={e => e.stopPropagation()} style={{ animation: 'badgePop var(--transition-base)', maxWidth: '800px' }}>
                        <button className="close-btn" onClick={() => setModalData(null)}>✕</button>
                        <div className="modal-header" style={{ borderBottom: '1px solid var(--color-muted-gold)', paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span className={`card-badge ${modalData.riskTier.toLowerCase()}`}>{modalData.riskTier} RISK</span>
                                <span className="tag type-badge">DHAROHAR-{modalData.type || 'BIO'}</span>
                            </div>
                            <h2 style={{ fontSize: '1.8rem' }}>{modalData.title}</h2>
                            <h5 className="card-subtitle" style={{ color: 'var(--color-terracotta)', fontWeight: 600 }}>{community.name} Archive</h5>
                        </div>

                        <div className="modal-body" style={{ marginTop: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
                            <div className="governance-notice-box" style={{ background: 'rgba(176, 141, 87, 0.05)', padding: '1rem', border: '1px solid var(--color-muted-gold)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                <strong>Institutional Notice:</strong> Full methodological details and high-resolution media are restricted under the <em>Cultural Governance Framework</em>.
                            </div>

                            <p className="full-desc" style={{ marginBottom: '1.5rem', lineHeight: '1.7' }}>{modalData.summary || modalData.fullDescription.substring(0, 150) + '...'}</p>

                            <div className="lock-overlay" style={{ background: '#f9f6f2', padding: '2rem', textAlign: 'center', border: '1px dashed var(--color-muted-gold)', marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🔒 DATA ENCRYPTED</div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                                    Full {modalData.type === 'BIO' ? 'Preparation Process & Usage Context' : 'High-Fidelity Audio & Cultural Meaning'} is hidden.
                                    <br />Requires an approved Institutional License.
                                </p>
                            </div>

                            <div className="context-box">
                                <strong>Archival Metadata</strong>
                                <ul style={{ fontSize: '0.9rem', paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                                    <li><strong>Origin:</strong> {community.region}</li>
                                    <li><strong>Archive ID:</strong> {modalData.id}</li>
                                    <li><strong>Attribution:</strong> {modalData.attribution.split('\n')[0]}</li>
                                </ul>
                            </div>
                        </div>

                        <div className="modal-footer" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', borderTop: '1px solid var(--color-muted-gold)', paddingTop: '1.5rem' }}>
                            {modalData.type === 'BIO' ? (
                                <>
                                    <button className="minimal-btn" style={{ flex: 1 }} onClick={() => navigate('/marketplace')}>Apply for Research License</button>
                                    <button className="primary-btn" style={{ flex: 1 }} onClick={() => navigate('/marketplace')}>Apply for Commercial License</button>
                                </>
                            ) : (
                                <button className="primary-btn" style={{ width: '100%' }} onClick={() => navigate('/marketplace')}>Apply for Media License</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    if (isModal) {
        return (
            <div className="community-modal-overlay" onClick={onClose}>
                <div className="community-modal-container" onClick={e => e.stopPropagation()}>
                    {content}
                </div>
            </div>
        );
    }

    return content;
};
