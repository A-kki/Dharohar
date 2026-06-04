import { useNavigate } from 'react-router-dom';
import { LicensingInfoSection } from '../marketplace/LicensingInfoSection';
import { BackButton } from '../../components/Navigation/BackButton';
import { useTranslation } from 'react-i18next';

export const LicensingGuide = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleApply = () => navigate('/marketplace');

    return (
        <div style={{ backgroundColor: 'var(--color-parchment)', minHeight: '100vh', padding: '4rem 2rem' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <BackButton />

                <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2.25rem', color: 'var(--color-burnt-umber)' }}>
                        📜 {t('licensingGuide.title', 'Licensing Framework Guide')}
                    </h2>
                    <p style={{ color: 'var(--color-text-light)', maxWidth: '600px', margin: '1rem auto 0', fontSize: '0.95rem' }}>
                        {t('licensingGuide.subtitle', 'Understand how cultural knowledge assets are licensed through DHAROHAR\'s structured governance framework.')}
                    </p>
                </header>

                {/* Bio Section */}
                <section style={{ marginBottom: '4rem' }}>
                    <div style={{
                        padding: '1rem 1.5rem',
                        borderLeft: '4px solid #4CAF50',
                        background: 'rgba(76, 175, 80, 0.06)',
                        borderRadius: '0 6px 6px 0',
                        marginBottom: '1.5rem'
                    }}>
                        <h3 style={{ color: '#388E3C', margin: 0, fontFamily: 'var(--font-serif)' }}>
                            {t('licensingGuide.bioTitle', '🌿 Biological Knowledge (BIO) Licenses')}
                        </h3>
                        <p style={{ color: 'var(--color-text-light)', margin: '0.35rem 0 0', fontSize: '0.9rem' }}>
                            {t('licensingGuide.bioDesc', 'For medicinal plants, agricultural techniques, ecological wisdom, and ritual practices.')}
                        </p>
                    </div>
                    <LicensingInfoSection assetType="BIO" onApply={handleApply} />
                </section>

                {/* Sonic Section */}
                <section>
                    <div style={{
                        padding: '1rem 1.5rem',
                        borderLeft: '4px solid #9C27B0',
                        background: 'rgba(156, 39, 176, 0.06)',
                        borderRadius: '0 6px 6px 0',
                        marginBottom: '1.5rem'
                    }}>
                        <h3 style={{ color: '#7B1FA2', margin: 0, fontFamily: 'var(--font-serif)' }}>
                            {t('licensingGuide.sonicTitle', '🎶 Sonic Heritage (SONIC) Licenses')}
                        </h3>
                        <p style={{ color: 'var(--color-text-light)', margin: '0.35rem 0 0', fontSize: '0.9rem' }}>
                            {t('licensingGuide.sonicDesc', 'For folk music, ritual chants, oral histories, and ceremonial performances.')}
                        </p>
                    </div>
                    <LicensingInfoSection assetType="SONIC" onApply={handleApply} />
                </section>
            </div>
        </div>
    );
};
