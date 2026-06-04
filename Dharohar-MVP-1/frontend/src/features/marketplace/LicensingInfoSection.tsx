import { useState } from 'react';
import './LicensingInfoSection.css';

interface LicenseCard {
    icon: string;
    title: string;
    subtitle: string;
    color: string;
    tags: string[];
    badge?: string;
    feeRange: string;
    feeNote: string;
    whoCanApply: string[];
    permitted: string[];
    prohibited: string[];
    duration: string;
    communityBenefit: string;
    communityPercent: string;
    legalFramework: string;
}

const BIO_LICENSES: LicenseCard[] = [
    {
        icon: '🎓',
        title: 'Research License',
        subtitle: 'For Universities & Researchers',
        color: '#4CAF50',
        tags: ['Non-Commercial', 'Educational'],
        feeRange: '₹10,000 – ₹1,00,000 / year',
        feeNote: 'Based on institution size and research scope',
        whoCanApply: [
            'Universities and colleges',
            'Research institutions',
            'Academic researchers',
            'Non-profit educational organizations',
        ],
        permitted: [
            'Use in academic research and study',
            'Publish in scholarly papers (with citation)',
            'Include in educational training programs',
            'Use in thesis or dissertation work',
            'Present at academic conferences',
        ],
        prohibited: [
            'Cannot develop commercial products',
            'Cannot file patents claiming ownership',
            'Cannot sell or monetize the knowledge',
            'Cannot transfer license to third parties',
        ],
        duration: '1–3 years (renewable)',
        communityBenefit: '80% of license fee goes directly to the community',
        communityPercent: '80%',
        legalFramework: 'Protected under Biological Diversity Act, 2002',
    },
    {
        icon: '💼',
        title: 'Commercial License',
        subtitle: 'For Business & Product Development',
        color: '#FF9800',
        tags: ['Profit-Making', 'Product Development'],
        badge: 'Higher Fee',
        feeRange: '₹2,00,000 – ₹50,00,000 one-time',
        feeNote: '+ 3–5% of product sales as ongoing royalties',
        whoCanApply: [
            'Pharmaceutical companies',
            'Herbal product manufacturers',
            'Cosmetics and wellness brands',
            'Food & beverage companies',
            'Biotechnology firms',
        ],
        permitted: [
            'Develop commercial products for sale',
            'Manufacture and distribute products',
            'Use in marketing and branding',
            'File patents (with benefit-sharing)',
            'Export products internationally',
        ],
        prohibited: [
            'Cannot claim sole ownership of traditional knowledge',
            'Cannot avoid royalty payments or underreport sales',
            'Cannot misrepresent the knowledge origin',
            'Cannot transfer license without approval',
        ],
        duration: '3–5 years (renewable with mutual consent)',
        communityBenefit: '80% of upfront fee + 80% of ongoing royalties go directly to the community',
        communityPercent: '80%',
        legalFramework: 'Governed by Biological Diversity Act, 2002 & Nagoya Protocol',
    },
];

const SONIC_LICENSES: LicenseCard[] = [
    {
        icon: '🎬',
        title: 'Media License',
        subtitle: 'For Films, TV & Content Creation',
        color: '#9C27B0',
        tags: ['Entertainment', 'Broadcasting', 'Digital Media'],
        feeRange: '₹25,000 – ₹10,00,000',
        feeNote: '+ ₹0.50 per 1,000 streams if commercially distributed',
        whoCanApply: [
            'Film and TV production houses',
            'Documentary filmmakers',
            'Streaming platforms (Netflix, Amazon, etc.)',
            'Advertising agencies',
            'Content creators and YouTubers',
        ],
        permitted: [
            'Use as background music in films/TV shows',
            'Include in documentaries and web series',
            'Stream on digital platforms',
            'Theatrical and festival screenings',
            'Use in promotional trailers and teasers',
        ],
        prohibited: [
            'Cannot alter lyrics or melody without permission',
            'Cannot use in political campaigns',
            'Cannot use in adult or offensive content',
            'Cannot claim ownership of the music',
        ],
        duration: '1 year (renewable)',
        communityBenefit: '80% of all fees and royalties go directly to the community',
        communityPercent: '80%',
        legalFramework: "Protected under Copyright Act, 1957 & Performers' Rights",
    },
    {
        icon: '🎵',
        title: 'Commercial Music License',
        subtitle: 'For Music Labels & Distribution',
        color: '#F44336',
        tags: ['Music Industry', 'Streaming', 'Albums'],
        badge: 'Higher Fee + Royalties',
        feeRange: '₹1,00,000 – ₹20,00,000',
        feeNote: '+ 10–15% of revenue as ongoing royalties',
        whoCanApply: [
            'Music labels and publishers',
            'Streaming platforms (Spotify, Apple Music)',
            'Artists seeking to remix or adapt',
            'Radio stations and broadcasters',
            'Music aggregators and distributors',
        ],
        permitted: [
            'Digital streaming on all platforms',
            'Include in albums and compilations',
            'Public performances and concerts',
            'Radio broadcasting',
            'Create remixes (with prior approval)',
        ],
        prohibited: [
            'Cannot alter sacred or ceremonial elements',
            'Cannot claim sole authorship',
            'Cannot avoid royalty payments',
            'Cannot sublicense without permission',
        ],
        duration: '1–3 years (renewable)',
        communityBenefit: '80% of upfront fee + 80% of ongoing royalties go directly to the community',
        communityPercent: '80%',
        legalFramework: 'Governed by Copyright Act, 1957 & IPRS Regulations',
    },
];

const HOW_IT_WORKS_STEPS = [
    'Choose your license type from the options above',
    'Click "Apply for License" and fill your organization details',
    'Admin reviews your application (2–5 business days)',
    'Once approved, receive legal agreement & full content access',
];

interface Props {
    assetType: 'BIO' | 'SONIC';
    onApply: (licenseType: string) => void;
}

export const LicensingInfoSection = ({ assetType, onApply }: Props) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const licenses = assetType === 'BIO' ? BIO_LICENSES : SONIC_LICENSES;

    const toggle = (title: string) => {
        setExpandedId(prev => (prev === title ? null : title));
    };

    const getApplyLicenseType = (title: string): string => {
        if (title === 'Research License') return 'RESEARCH';
        if (title === 'Commercial License') return 'COMMERCIAL';
        if (title === 'Media License') return 'MEDIA';
        return 'MUSIC';
    };

    return (
        <div className="lis-root">
            <div className="lis-header">
                <h3 className="lis-title">📜 Licensing Options</h3>
                <p className="lis-subtitle">
                    {assetType === 'BIO'
                        ? 'This biological knowledge asset can be licensed for research or commercial use.'
                        : 'This sonic heritage asset can be licensed for media or music distribution.'}
                </p>
            </div>

            {/* License Cards */}
            <div className="lis-cards">
                {licenses.map((lic) => {
                    const isOpen = expandedId === lic.title;
                    return (
                        <div
                            key={lic.title}
                            className={`lis-card ${isOpen ? 'lis-card--open' : ''}`}
                            style={{ '--lic-color': lic.color } as React.CSSProperties}
                        >
                            {/* ── Card Top: Icon + Title block ── */}
                            <div className="lis-card-top">
                                <div className="lis-card-icon-title">
                                    <span className="lis-icon" role="img" aria-hidden="true">{lic.icon}</span>
                                    <div className="lis-title-block">
                                        <span className="lis-card-title">{lic.title}</span>
                                        {lic.badge && (
                                            <span className="lis-badge" style={{ backgroundColor: lic.color }}>
                                                {lic.badge}
                                            </span>
                                        )}
                                        <span className="lis-card-subtitle">{lic.subtitle}</span>
                                    </div>
                                </div>
                            </div>

                            {/* ── Fee Block (separate row) ── */}
                            <div className="lis-fee-block">
                                <span className="lis-fee-amount" style={{ color: lic.color }}>{lic.feeRange}</span>
                                <span className="lis-fee-note">{lic.feeNote}</span>
                            </div>

                            {/* ── Tags ── */}
                            <div className="lis-tags">
                                {lic.tags.map(tag => (
                                    <span key={tag} className="lis-tag" style={{ color: lic.color, borderColor: lic.color }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* ── Learn More Button ── */}
                            <button
                                type="button"
                                className="lis-learn-btn"
                                style={{ color: lic.color, borderColor: lic.color }}
                                onClick={() => toggle(lic.title)}
                                aria-expanded={isOpen}
                            >
                                {isOpen ? 'Hide Details ▲' : 'Learn More ↓'}
                            </button>

                            {/* ── Expanded: Full Details (single-column, no overflow) ── */}
                            {isOpen && (
                                <div className="lis-expand-body">
                                    <div className="lis-section">
                                        <h5 className="lis-section-title" style={{ color: lic.color }}>👥 Who Can Apply</h5>
                                        <ul className="lis-list">
                                            {lic.whoCanApply.map(item => <li key={item}>{item}</li>)}
                                        </ul>
                                    </div>

                                    <div className="lis-section">
                                        <h5 className="lis-section-title lis-section-title--green">✅ What You Can Do</h5>
                                        <ul className="lis-list lis-list--green">
                                            {lic.permitted.map(item => <li key={item}>{item}</li>)}
                                        </ul>
                                    </div>

                                    <div className="lis-section">
                                        <h5 className="lis-section-title lis-section-title--red">❌ Restrictions</h5>
                                        <ul className="lis-list lis-list--red">
                                            {lic.prohibited.map(item => <li key={item}>{item}</li>)}
                                        </ul>
                                    </div>

                                    <div className="lis-section">
                                        <h5 className="lis-section-title" style={{ color: lic.color }}>⏳ Duration</h5>
                                        <p className="lis-duration-text">{lic.duration}</p>
                                    </div>

                                    {/* Community Benefit Highlight */}
                                    <div className="lis-community-benefit" style={{ borderColor: lic.color }}>
                                        <div className="lis-benefit-percent" style={{ color: lic.color }}>
                                            {lic.communityPercent}
                                        </div>
                                        <div>
                                            <strong className="lis-benefit-label">🏘️ Community Benefit</strong>
                                            <p className="lis-benefit-text">{lic.communityBenefit}</p>
                                        </div>
                                    </div>

                                    <p className="lis-legal">⚖️ {lic.legalFramework}</p>

                                    {/* Per-card Apply button */}
                                    <button
                                        type="button"
                                        className="primary-btn lis-card-apply-btn"
                                        style={{ backgroundColor: lic.color }}
                                        onClick={() => onApply(getApplyLicenseType(lic.title))}
                                    >
                                        Apply for {lic.title}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* How It Works */}
            <div className="lis-how-it-works">
                <h4 className="lis-hiw-title">ℹ️ How It Works</h4>
                <ol className="lis-hiw-steps">
                    {HOW_IT_WORKS_STEPS.map((step, i) => (
                        <li key={i} className="lis-hiw-step">
                            <span className="lis-hiw-num">{i + 1}</span>
                            <span>{step}</span>
                        </li>
                    ))}
                </ol>
                <p className="lis-hiw-support">
                    Questions? Contact: <a href="mailto:support@dharohar.gov.in">support@dharohar.gov.in</a>
                </p>
            </div>

            {/* Main CTA */}
            <div className="lis-cta">
                <button
                    type="button"
                    className="primary-btn lis-apply-btn"
                    onClick={() => onApply(assetType === 'BIO' ? 'RESEARCH' : 'MEDIA')}
                >
                    Apply for License →
                </button>
                <p className="lis-cta-note">You must be logged in with an approved account to apply.</p>
            </div>
        </div>
    );
};
