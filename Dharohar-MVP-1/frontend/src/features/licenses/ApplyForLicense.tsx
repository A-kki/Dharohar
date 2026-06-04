import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { applyForLicense } from '../../services/licenseService';
import { LicenseApplicationDoc } from '../dashboard/LicenseApplicationDoc';
import type { ApplicationData } from '../dashboard/LicenseApplicationDoc';
import { BioKnowledgeApplicationDoc } from '../dashboard/BioKnowledgeApplicationDoc';
import type { BioKnowledgeDocData } from '../dashboard/BioKnowledgeApplicationDoc';
import { BioKnowledgeLicenseForm, defaultBioKnowledgeData, isBioConfirmed } from './BioKnowledgeLicenseForm';
import type { BioKnowledgeFormData } from './BioKnowledgeLicenseForm';
import { useAuth } from '../auth/AuthContext';
import apiClient from '../../services/apiClient';
import { useNotificationSound } from '../../hooks/useNotificationSound';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next'; // We import 't' directly for the standalone validateCommon function
import { RoleMediaPlayer } from '../../components/RoleMediaPlayer';

type LicenseType = 'RESEARCH' | 'COMMERCIAL' | 'MEDIA' | 'BIO_KNOWLEDGE';

// ── Validation helpers ────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{10}$/;
const GST_RE = /^[0-9A-Z]{15}$/;

const countWords = (text: string) =>
    text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

// ── Common field types ────────────────────────────────────────────────────────
interface CommonFields {
    fullName: string;
    email: string;
    phone: string;
    organizationName: string;
    gstNumber: string;
    intendedUse: string;
}

interface CommonErrors {
    fullName?: string;
    email?: string;
    phone?: string;
    organizationName?: string;
    gstNumber?: string;
    intendedUse?: string;
    docFile?: string;
}

const validateCommon = (fields: CommonFields, file: File | null): CommonErrors => {
    const errors: CommonErrors = {};
    if (!fields.fullName || fields.fullName.trim().length < 3)
        errors.fullName = t('applyLicense.errFullName', 'Full name must be at least 3 characters.');
    if (!fields.email || !EMAIL_RE.test(fields.email))
        errors.email = t('applyLicense.errEmail', 'Enter a valid email address.');
    if (!fields.phone || !PHONE_RE.test(fields.phone))
        errors.phone = t('applyLicense.errPhone', 'Phone number must be exactly 10 digits.');
    if (!fields.organizationName || fields.organizationName.trim().length < 2)
        errors.organizationName = t('applyLicense.errOrg', 'Organization name is required.');
    if (!fields.gstNumber || !GST_RE.test(fields.gstNumber.toUpperCase()))
        errors.gstNumber = t('applyLicense.errGst', 'GST number must be exactly 15 alphanumeric characters (uppercase).');
    const words = countWords(fields.intendedUse);
    if (words < 30)
        errors.intendedUse = t('applyLicense.errWordsMin', 'Minimum 30 words required. Currently: {{words}}.', { words });
    else if (words > 300)
        errors.intendedUse = t('applyLicense.errWordsMax', 'Maximum 300 words allowed. Currently: {{words}}.', { words });
    if (file) {
        if (file.type !== 'application/pdf')
            errors.docFile = t('applyLicense.errPdf', 'Only PDF files are accepted.');
        else if (file.size > 5 * 1024 * 1024)
            errors.docFile = t('applyLicense.errSize', 'File size must not exceed 5 MB.');
    }
    return errors;
};

// ── Shared style tokens ───────────────────────────────────────────────────────
const baseInput: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: '1.5px solid var(--color-muted-gold)',
    borderRadius: '4px',
    background: 'white',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    transition: 'border-color 200ms ease',
};

const errorInput: React.CSSProperties = {
    ...baseInput,
    border: '1.5px solid #ef4444',
    background: '#fff8f8',
};

const errorMsg: React.CSSProperties = {
    fontSize: '0.78rem',
    color: '#dc2626',
    marginTop: '0.3rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
};

const fieldWrap: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
};

const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--color-text-main)',
};

const reqStar: React.CSSProperties = { color: '#ef4444', marginLeft: '2px' };

// ── Reusable Field wrapper ────────────────────────────────────────────────────
const Field = ({
    label, required, error, hint, children,
}: {
    label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) => (
    <div style={fieldWrap}>
        <label style={labelStyle}>
            {label}{required && <span style={reqStar}>*</span>}
        </label>
        {children}
        {hint && !error && (
            <span style={{ fontSize: '0.76rem', color: 'var(--color-text-light)' }}>{hint}</span>
        )}
        {error && (
            <span style={errorMsg}>⚠ {error}</span>
        )}
    </div>
);

// ── Common Applicant Identity Section ─────────────────────────────────────────
const CommonApplicantFields = ({
    fields,
    errors,
    touched,
    docFile,
    onFieldChange,
    onFileChange,
    onBlur,
}: {
    fields: CommonFields;
    errors: CommonErrors;
    touched: Set<string>;
    docFile: File | null;
    onFieldChange: (k: keyof CommonFields, v: string) => void;
    onFileChange: (f: File | null) => void;
    onBlur: (k: string) => void;
}) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const wordCount = countWords(fields.intendedUse);
    const wordCountColor =
        wordCount < 30 ? '#d97706' : wordCount > 300 ? '#dc2626' : '#16a34a';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Section header */}
            <div style={{
                padding: '0.8rem 1rem',
                background: 'rgba(176,141,87,0.07)',
                border: '1px solid var(--color-muted-gold)',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--color-burnt-umber)',
                letterSpacing: '0.02em',
            }}>
                👤 {t('applyLicense.applicantIdentity', 'Applicant Identity & Contact')}
            </div>

            {/* Row: Full Name + Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label={t('applyLicense.fullName', 'Full Name')} required error={touched.has('fullName') ? errors.fullName : undefined}>
                    <input
                        style={touched.has('fullName') && errors.fullName ? errorInput : baseInput}
                        value={fields.fullName}
                        placeholder={t('applyLicense.fullNamePlaceholder', 'e.g. Arjun Sharma')}
                        onChange={e => onFieldChange('fullName', e.target.value)}
                        onBlur={() => onBlur('fullName')}
                    />
                </Field>
                <Field label={t('applyLicense.email', 'Email Address')} required error={touched.has('email') ? errors.email : undefined}>
                    <input
                        type="email"
                        style={touched.has('email') && errors.email ? errorInput : baseInput}
                        value={fields.email}
                        placeholder={t('applyLicense.emailPlaceholder', 'you@institution.ac.in')}
                        onChange={e => onFieldChange('email', e.target.value)}
                        onBlur={() => onBlur('email')}
                    />
                </Field>
            </div>

            {/* Row: Phone + Organization */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field
                    label={t('applyLicense.phone', 'Phone Number')}
                    required
                    error={touched.has('phone') ? errors.phone : undefined}
                    hint={t('applyLicense.phoneHint', '10-digit mobile number')}
                >
                    <input
                        style={touched.has('phone') && errors.phone ? errorInput : baseInput}
                        value={fields.phone}
                        placeholder={t('applyLicense.phonePlaceholder', '9876543210')}
                        maxLength={10}
                        onChange={e => onFieldChange('phone', e.target.value.replace(/\D/g, ''))}
                        onBlur={() => onBlur('phone')}
                    />
                </Field>
                <Field label={t('applyLicense.organization', 'Organization / Institution Name')} required error={touched.has('organizationName') ? errors.organizationName : undefined}>
                    <input
                        style={touched.has('organizationName') && errors.organizationName ? errorInput : baseInput}
                        value={fields.organizationName}
                        placeholder={t('applyLicense.orgPlaceholder', 'IIT Bombay, Acme Ltd., etc.')}
                        onChange={e => onFieldChange('organizationName', e.target.value)}
                        onBlur={() => onBlur('organizationName')}
                    />
                </Field>
            </div>

            {/* GST Number */}
            <Field
                label={t('applyLicense.gstNumber', 'GST Number')}
                required
                error={touched.has('gstNumber') ? errors.gstNumber : undefined}
                hint={t('applyLicense.gstHint', '15-character alphanumeric (e.g. 27ABCDE1234F1Z5)')}
            >
                <input
                    style={touched.has('gstNumber') && errors.gstNumber ? errorInput : baseInput}
                    value={fields.gstNumber}
                    placeholder={t('applyLicense.gstPlaceholder', '27ABCDE1234F1Z5')}
                    maxLength={15}
                    onChange={e => onFieldChange('gstNumber', e.target.value.toUpperCase())}
                    onBlur={() => onBlur('gstNumber')}
                />
            </Field>

            {/* Intended Use Description */}
            <Field
                label={t('applyLicense.intendedUse', 'Intended Use Description')}
                required
                error={touched.has('intendedUse') ? errors.intendedUse : undefined}
            >
                <div style={{ position: 'relative' }}>
                    <textarea
                        style={{
                            ...(touched.has('intendedUse') && errors.intendedUse ? errorInput : baseInput),
                            minHeight: '130px',
                            resize: 'vertical',
                            paddingBottom: '2rem',
                        }}
                        value={fields.intendedUse}
                        placeholder={t('applyLicense.intendedUsePlaceholder', 'Describe in detail how you intend to use this cultural asset. Include your objective, methodology, and expected outcomes... (minimum 30 words, maximum 300 words)')}
                        onChange={e => onFieldChange('intendedUse', e.target.value)}
                        onBlur={() => onBlur('intendedUse')}
                    />
                    {/* Live counter badge */}
                    <div style={{
                        position: 'absolute',
                        bottom: '0.5rem',
                        right: '0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: wordCountColor,
                        background: 'white',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        border: `1px solid ${wordCountColor}`,
                        pointerEvents: 'none',
                    }}>
                        {t('applyLicense.wordsCount', '{{count}} / 300 words', { count: wordCount })}
                        {wordCount < 30 && <span style={{ marginLeft: '4px' }}>{t('applyLicense.wordsCountMin', '(min 30)')}</span>}
                    </div>
                </div>
            </Field>

            {/* Supporting Document Upload */}
            <Field
                label={t('applyLicense.supportingDoc', 'Supporting Document')}
                error={touched.has('docFile') ? errors.docFile : undefined}
                hint={t('applyLicense.supportingDocHint', 'Upload a PDF (max 5 MB) — ethics approval, company registration, press credentials, etc.')}
            >
                <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                        border: `1.5px dashed ${touched.has('docFile') && errors.docFile ? '#ef4444' : 'var(--color-muted-gold)'}`,
                        borderRadius: '4px',
                        padding: '1rem 1.25rem',
                        cursor: 'pointer',
                        background: docFile ? 'rgba(22,163,74,0.04)' : 'rgba(176,141,87,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'background 200ms',
                    }}
                >
                    <span style={{ fontSize: '1.4rem' }}>{docFile ? '📄' : '📎'}</span>
                    <div style={{ flex: 1 }}>
                        {docFile ? (
                            <>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#16a34a' }}>
                                    {docFile.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                                    {(docFile.size / 1024 / 1024).toFixed(2)} MB — PDF
                                </div>
                            </>
                        ) : (
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                                {t('applyLicense.clickToSelectPdf', 'Click to select a PDF file')} <span style={{ fontSize: '0.78rem' }}>{t('applyLicense.optional', '(optional but recommended)')}</span>
                            </div>
                        )}
                    </div>
                    {docFile && (
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); onFileChange(null); if (fileRef.current) fileRef.current.value = ''; onBlur('docFile'); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1rem', padding: '0' }}
                            title="Remove file"
                        >
                            ✕
                        </button>
                    )}
                </div>
                <input
                    ref={fileRef}
                    type="file"
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    onChange={e => {
                        onFileChange(e.target.files?.[0] || null);
                        onBlur('docFile');
                    }}
                />
            </Field>

            {/* Divider */}
            <div style={{ borderTop: '1px dashed var(--color-muted-gold)', marginTop: '0.25rem' }} />
        </div>
    );
};

// ── License-type sub-forms ────────────────────────────────────────────────────
const ResearchForm = ({ data, onChange }: {
    data: any;
    onChange: (k: string, v: string) => void;
}) => {
    const { t } = useTranslation();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(59,130,246,0.06)', border: '1px solid #3b82f6', borderRadius: '4px', fontSize: '0.85rem' }}>
                🔬 <strong>{t('applyLicense.researchLicense', 'Research License')}</strong> — {t('applyLicense.researchLicenseDesc', 'For academic/scientific use. Requires institutional affiliation and IRB/ethics approval.')}
            </div>
            <Field label={t('applyLicense.leadResearcher', 'Lead Researcher Full Name')} required>
                <input style={baseInput} value={data.leadResearcher || ''} onChange={e => onChange('leadResearcher', e.target.value)} placeholder={t('applyLicense.leadResearcherPlaceholder', 'Dr. Priya Sharma')} />
            </Field>
            <Field label={t('applyLicense.researchTitle', 'Research Project Title')} required>
                <input style={baseInput} value={data.researchTitle || ''} onChange={e => onChange('researchTitle', e.target.value)} placeholder={t('applyLicense.researchTitlePlaceholder', 'Study on Warli Ethnobotanical Practices')} />
            </Field>
            <Field label={t('applyLicense.researchObjective', 'Research Objective')} required>
                <textarea style={{ ...baseInput, minHeight: '80px' }} value={data.researchObjective || ''} onChange={e => onChange('researchObjective', e.target.value)} placeholder={t('applyLicense.researchObjectivePlaceholder', 'Describe the academic objective and intended contribution...')} />
            </Field>
            <Field label={t('applyLicense.detailedPurpose', 'Detailed Purpose of Use')} required>
                <textarea style={{ ...baseInput, minHeight: '80px' }} value={data.purpose || ''} onChange={e => onChange('purpose', e.target.value)} placeholder={t('applyLicense.researchPurposePlaceholder', 'How specifically will you use this cultural asset in your research?')} />
            </Field>
            <Field label={t('applyLicense.irbReference', 'IRB / Ethics Board Reference')}>
                <input style={baseInput} value={data.irb_ethics_approval || ''} onChange={e => onChange('irb_ethics_approval', e.target.value)} placeholder={t('applyLicense.irbReferencePlaceholder', 'IRB-2024-xxxxx or document URL')} />
            </Field>
            <Field label={t('applyLicense.expectedDuration', 'Expected Research Duration')}>
                <input style={baseInput} value={data.expectedDuration || ''} onChange={e => onChange('expectedDuration', e.target.value)} placeholder={t('applyLicense.expectedDurationPlaceholder', 'e.g. 12 months (Jan 2025 – Dec 2025)')} />
            </Field>
            <Field label={t('applyLicense.publicationPlan', 'Publication / Dissemination Plan')}>
                <textarea style={{ ...baseInput, minHeight: '60px' }} value={data.publicationPlan || ''} onChange={e => onChange('publicationPlan', e.target.value)} placeholder={t('applyLicense.publicationPlanPlaceholder', 'Peer-reviewed journal, conference presentation, open access, etc.')} />
            </Field>
        </div>
    );
};

const CommercialForm = ({ data, onChange }: { data: any; onChange: (k: string, v: string) => void }) => {
    const { t } = useTranslation();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(251,146,60,0.08)', border: '1px solid #fb923c', borderRadius: '4px', fontSize: '0.85rem' }}>
                🏢 <strong>{t('applyLicense.commercialLicense', 'Commercial License')}</strong> — {t('applyLicense.commercialLicenseDesc', 'For product development, branding, or commercial exploitation. Revenue sharing with the originating community may apply.')}
            </div>
            <Field label={t('applyLicense.companyName', 'Company / Organization Name')} required>
                <input style={baseInput} value={data.companyName || ''} onChange={e => onChange('companyName', e.target.value)} placeholder={t('applyLicense.companyNamePlaceholder', 'Acme Naturals Pvt. Ltd.')} />
            </Field>
            <Field label={t('applyLicense.companyRegistration', 'Company Registration Number')}>
                <input style={baseInput} value={data.companyRegistration || ''} onChange={e => onChange('companyRegistration', e.target.value)} placeholder={t('applyLicense.companyRegistrationPlaceholder', 'CIN No.')} />
            </Field>
            <Field label={t('applyLicense.productName', 'Product / Service Name')} required>
                <input style={baseInput} value={data.productName || ''} onChange={e => onChange('productName', e.target.value)} placeholder={t('applyLicense.productNamePlaceholder', 'Product name using this cultural knowledge')} />
            </Field>
            <Field label={t('applyLicense.commercialUseDescription', 'Detailed Description of Commercial Use')} required>
                <textarea style={{ ...baseInput, minHeight: '90px' }} value={data.commercialUseDescription || ''} onChange={e => onChange('commercialUseDescription', e.target.value)} placeholder={t('applyLicense.commercialUsePlaceholder', 'Describe exactly how this asset will be used in your product/service...')} />
            </Field>
            <Field label={t('applyLicense.detailedPurpose', 'Detailed Purpose')} required>
                <textarea style={{ ...baseInput, minHeight: '70px' }} value={data.purpose || ''} onChange={e => onChange('purpose', e.target.value)} placeholder={t('applyLicense.commercialPurposePlaceholder', 'What business need does this fulfill?')} />
            </Field>
            <Field label={t('applyLicense.expectedRevenue', 'Expected Annual Revenue from this use')}>
                <input style={baseInput} value={data.expectedRevenue || ''} onChange={e => onChange('expectedRevenue', e.target.value)} placeholder={t('applyLicense.expectedRevenuePlaceholder', 'e.g. ₹50 Lakhs – ₹1 Crore')} />
            </Field>
            <Field label={t('applyLicense.proposedRoyaltyRate', 'Proposed Royalty / Revenue Share with Community')}>
                <input style={baseInput} value={data.proposedRoyaltyRate || ''} onChange={e => onChange('proposedRoyaltyRate', e.target.value)} placeholder={t('applyLicense.proposedRoyaltyRatePlaceholder', 'e.g. 5% of net revenue')} />
            </Field>
            <Field label={t('applyLicense.communityBenefitPlan', 'Community Benefit Plan')}>
                <textarea style={{ ...baseInput, minHeight: '70px' }} value={data.communityBenefitPlan || ''} onChange={e => onChange('communityBenefitPlan', e.target.value)} placeholder={t('applyLicense.communityBenefitPlanPlaceholder', 'How will the originating community directly benefit?')} />
            </Field>
        </div>
    );
};

const MediaForm = ({ data, onChange }: { data: any; onChange: (k: string, v: string) => void }) => {
    const { t } = useTranslation();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(168,85,247,0.06)', border: '1px solid #a855f7', borderRadius: '4px', fontSize: '0.85rem' }}>
                🎬 <strong>{t('applyLicense.mediaLicense', 'Media License')}</strong> — {t('applyLicense.mediaLicenseDesc', 'For films, documentaries, podcasts, journalism, or digital media featuring this sonic cultural asset.')}
            </div>
            <Field label={t('applyLicense.projectTitle', 'Project Title')} required>
                <input style={baseInput} value={data.projectTitle || ''} onChange={e => onChange('projectTitle', e.target.value)} placeholder={t('applyLicense.projectTitlePlaceholder', "e.g. 'Echoes of the Forest' — Documentary Film")} />
            </Field>
            <Field label={t('applyLicense.mediaType', 'Media Type')} required>
                <select style={baseInput} value={data.mediaType || ''} onChange={e => onChange('mediaType', e.target.value)}>
                    <option value="">{t('applyLicense.selectMediaType', 'Select media type...')}</option>
                    <option>{t('applyLicense.featureFilm', 'Feature Film')}</option><option>{t('applyLicense.documentary', 'Documentary')}</option><option>{t('applyLicense.shortFilm', 'Short Film')}</option>
                    <option>{t('applyLicense.podcast', 'Podcast / Audio Series')}</option><option>{t('applyLicense.musicAlbum', 'Music Album')}</option>
                    <option>{t('applyLicense.advertisement', 'Advertisement')}</option><option>{t('applyLicense.digitalContent', 'Digital Content / YouTube')}</option>
                    <option>{t('applyLicense.newsJournalism', 'News / Journalism')}</option><option>{t('applyLicense.other', 'Other')}</option>
                </select>
            </Field>
            <Field label={t('applyLicense.distributionPlatform', 'Distribution Platform')} required>
                <input style={baseInput} value={data.distributionPlatform || ''} onChange={e => onChange('distributionPlatform', e.target.value)} placeholder={t('applyLicense.distributionPlatformPlaceholder', 'Netflix, YouTube, Spotify, Cinema, etc.')} />
            </Field>
            <Field label={t('applyLicense.detailedPurpose', 'Detailed Purpose of Use')} required>
                <textarea style={{ ...baseInput, minHeight: '80px' }} value={data.purpose || ''} onChange={e => onChange('purpose', e.target.value)} placeholder={t('applyLicense.mediaPurposePlaceholder', 'How will this asset appear / be used in the project?')} />
            </Field>
            <Field label={t('applyLicense.estimatedAudience', 'Estimated Audience Reach')}>
                <input style={baseInput} value={data.estimatedAudience || ''} onChange={e => onChange('estimatedAudience', e.target.value)} placeholder={t('applyLicense.estimatedAudiencePlaceholder', 'e.g. 500,000 viewers, global release')} />
            </Field>
            <Field label={t('applyLicense.creditingPlan', 'Attribution / Crediting Plan')} required>
                <textarea style={{ ...baseInput, minHeight: '60px' }} value={data.creditingPlan || ''} onChange={e => onChange('creditingPlan', e.target.value)} placeholder={t('applyLicense.creditingPlanPlaceholder', 'How will the originating community and artists be credited?')} />
            </Field>
        </div>
    );
};

// ── Main component ─────────────────────────────────────────────────────────────
export const ApplyForLicense = () => {
    const { t } = useTranslation();
    const { assetId } = useParams<{ assetId: string }>();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const assetTitle = searchParams.get('title') || t('common.culturalAsset', 'Cultural Asset');
    const assetType = searchParams.get('assetType') || 'BIO';
    const communityName = searchParams.get('community') || '';
    const mediaUrl = searchParams.get('mediaUrl') || '';
    const mediaFileId = searchParams.get('mediaFileId') || '';
    const navigate = useNavigate();
    const playSound = useNotificationSound();
    const formRef = useRef<HTMLFormElement>(null);

    const defaultType: LicenseType = assetType === 'SONIC' ? 'MEDIA' : 'RESEARCH';
    const [licenseType, setLicenseType] = useState<LicenseType>(defaultType);

    // Common fields state
    const [common, setCommon] = useState<CommonFields>({
        fullName: '',
        email: user?.email || '',
        phone: '',
        organizationName: '',
        gstNumber: '',
        intendedUse: '',
    });
    const [touched, setTouched] = useState<Set<string>>(new Set());
    const [docFile, setDocFile] = useState<File | null>(null);
    const [commonErrors, setCommonErrors] = useState<CommonErrors>({});

    // Sub-form data
    const [formData, setFormData] = useState<Record<string, string>>({});

    // ── Bio-Knowledge specific state ──────────────────────────────────────────
    const [bioData, setBioData] = useState<BioKnowledgeFormData>(defaultBioKnowledgeData);
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [bioPdfPreview, setBioPdfPreview] = useState<BioKnowledgeDocData | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<ApplicationData | null>(null);

    // Re-validate whenever common fields or the file changes
    useEffect(() => {
        setCommonErrors(validateCommon(common, docFile));
    }, [common, docFile]);

    const handleCommonChange = (k: keyof CommonFields, v: string) => {
        setCommon(prev => ({ ...prev, [k]: v }));
    };

    const handleBlur = (k: string) => {
        setTouched(prev => new Set(prev).add(k));
    };

    const handleFieldChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const isFormValid = Object.keys(commonErrors).length === 0;

    // Build ApplicationData for PDF preview (Research / Commercial / Media)
    const buildDocData = (): ApplicationData => ({
        applicantName: common.fullName || formData.leadResearcher || formData.companyName || 'Applicant',
        organizationName: common.organizationName || formData.institutionName || formData.companyName || '',
        email: common.email || user?.email || '',
        phone: common.phone || '',
        address: '',
        assetTitle,
        communityName: communityName || 'Originating Community',
        licenseType,
        purpose: formData.purpose || formData.commercialUseDescription || common.intendedUse || '',
        duration: formData.expectedDuration || '1 year',
        documentation: docFile?.name || formData.documentation || '',
        signedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
    });

    // Build BioKnowledgeDocData for Bio-Knowledge PDF preview
    const buildBioDocData = (): BioKnowledgeDocData => ({
        applicantName: common.fullName || 'Applicant',
        email: common.email || user?.email || '',
        phone: common.phone || '',
        assetTitle,
        communityName: communityName || bioData.communityOfOrigin || 'Originating Community',
        signedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
        bioDetails: bioData,
        evidenceFileName: evidenceFile?.name,
    });

    // Validate Bio-Knowledge required fields
    const isBioFormValid = () => {
        const checks = {
            fullName: common.fullName.trim().length >= 3,
            phone: PHONE_RE.test(common.phone),
            age: bioData.age !== '',
            gender: bioData.gender !== '',
            address: bioData.address.trim().length > 5,
            specialisation: bioData.specialisation !== '',
            knowledgeDomains: bioData.knowledgeDomains.length > 0,
            yearsExperience: bioData.yearsExperience !== '',
            acquisitionMethod: bioData.acquisitionMethod.trim().length > 10,
            practiceDescription: bioData.practiceDescription.trim().length > 30,
            geographicalRegion: bioData.geographicalRegion.trim().length > 2,
            sourceType: bioData.sourceType !== '',
            communityOfOrigin: bioData.communityOfOrigin.trim().length > 2,
            isSacredKnowledge: bioData.isSacredKnowledge !== '',
            communityStatus: bioData.communityStatus !== '',
            recognitionType: bioData.recognitionType.length > 0,
            confirmed: isBioConfirmed(formRef.current)
        };
        const failedChecks = Object.entries(checks).filter(([_, passed]) => !passed);
        if (failedChecks.length > 0) {
            console.error('Bio form validation failed on:', failedChecks.map(f => f[0]));
        }
        return failedChecks.length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Guard against broken URLs (e.g. from before the _id -> id refactor)
        if (!assetId || assetId === 'undefined') {
            setError(t('applyLicense.invalidAsset', 'Invalid asset ID. Please return to the marketplace and try applying again.'));
            return;
        }

        // ── Bio-Knowledge submission path ────────────────────────────────────
        if (licenseType === 'BIO_KNOWLEDGE') {
            if (!isBioConfirmed(formRef.current)) {
                setError('Please agree to the Declaration & Confirmation on the final step before submitting.');
                return;
            }
            if (!isBioFormValid()) {
                setError('Please fill in all required fields in the Bio-Knowledge Application form.');
                return;
            }
            setIsSubmitting(true);
            setError('');
            try {
                let evidenceFileId: string | undefined;
                if (evidenceFile) {
                    const fd = new FormData();
                    fd.append('file', evidenceFile);
                    const uploadRes = await apiClient.post<{ fileId: string }>('/storage/upload', fd, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    evidenceFileId = uploadRes.data.fileId;
                }
                await applyForLicense({
                    assetId: assetId!,
                    licenseType: 'BIO_KNOWLEDGE',
                    purpose: bioData.practiceDescription,
                    fullName: common.fullName,
                    email: common.email,
                    phone: common.phone,
                    organizationName: common.organizationName || '',
                    gstNumber: common.gstNumber || '',
                    intendedUse: bioData.practiceDescription,
                    ...(evidenceFileId && { documentationFileId: evidenceFileId }),
                    bioKnowledgeDetails: JSON.stringify(bioData),
                });
                playSound();
                setSuccess(true);
            } catch (err: any) {
                setError(err.response?.data?.message || t('applyLicense.submissionFailed', 'Submission failed. Please try again.'));
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        // ── Standard Research / Commercial / Media submission path ─────────
        // Touch all common fields to surface errors
        const allCommonKeys: (keyof CommonFields)[] = ['fullName', 'email', 'phone', 'organizationName', 'gstNumber', 'intendedUse'];
        setTouched(new Set([...allCommonKeys, 'docFile']));

        const errs = validateCommon(common, docFile);
        if (Object.keys(errs).length > 0) {
            setError(t('applyLicense.fixErrors', 'Please fix the highlighted errors before submitting.'));
            return;
        }

        if (!formData.purpose?.trim() && licenseType !== 'COMMERCIAL') {
            setError(t('applyLicense.purposeRequired', 'Please fill in the "Purpose of Use" field in the license section.'));
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            let documentationFileId: string | undefined;

            // Upload supporting document first if provided
            if (docFile) {
                const fd = new FormData();
                fd.append('file', docFile);
                const uploadRes = await apiClient.post<{ fileId: string }>('/storage/upload', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                documentationFileId = uploadRes.data.fileId;
            }

            await applyForLicense({
                assetId: assetId!,
                licenseType,
                purpose: formData.purpose || formData.commercialUseDescription || common.intendedUse,
                documentation: formData.documentation,
                // New common applicant fields
                fullName: common.fullName,
                email: common.email,
                phone: common.phone,
                organizationName: common.organizationName,
                gstNumber: common.gstNumber,
                intendedUse: common.intendedUse,
                ...(documentationFileId && { documentationFileId }),
                // Sub-form specific extra fields
                ...Object.fromEntries(
                    Object.entries(formData).filter(([k]) => k !== 'purpose' && k !== 'documentation')
                ),
            });

            playSound();
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || t('applyLicense.submissionFailed', 'Submission failed. Please try again.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--color-parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="framed-section" style={{ maxWidth: 520, textAlign: 'center', padding: '2.5rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <h3>{t('applyLicense.successTitle', 'License Application Submitted')}</h3>
                    <p style={{ color: 'var(--color-text-light)' }}>
                        {t('applyLicense.successMsg1', 'Your')} <strong>{
                            licenseType === 'BIO_KNOWLEDGE' ? 'Bio-Knowledge Application' :
                                licenseType === 'RESEARCH' ? t('applyLicense.researchLicense', 'Research License') :
                                    licenseType === 'COMMERCIAL' ? t('applyLicense.commercialLicense', 'Commercial License') :
                                        t('applyLicense.mediaLicense', 'Media License')
                        }</strong> {t('applyLicense.successMsg2', 'license application for')} <em>{assetTitle}</em> {t('applyLicense.successMsg3', 'has been received and is now under admin review.')}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '0.5rem' }}>
                        {t('applyLicense.trackStatus', 'Track your application status in your dashboard.')}
                    </p>
                    <div style={{ margin: '1.5rem 0', padding: '1rem 1.25rem', background: 'rgba(176,141,87,0.08)', border: '1px solid var(--color-muted-gold)', borderRadius: '6px', textAlign: 'left' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', margin: '0 0 0.75rem', fontWeight: 600 }}>
                            📄 {t('applyLicense.downloadCopy', 'Download a copy of your application?')}
                        </p>
                        <button type="button" className="minimal-btn" style={{ fontSize: '0.85rem' }} onClick={() => {
                            if (licenseType === 'BIO_KNOWLEDGE') {
                                setBioPdfPreview(buildBioDocData());
                            } else {
                                setPreviewDoc(buildDocData());
                            }
                        }}>
                            ⬇ {t('applyLicense.previewDownload', 'Preview & Download Application Document')}
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="primary-btn" onClick={() => navigate('/dashboard/licenses/mine')}>{t('applyLicense.viewMyApplications', 'View My Applications')}</button>
                        <button className="minimal-btn" onClick={() => navigate('/marketplace')}>{t('applyLicense.backToMarketplace', 'Back to Marketplace')}</button>
                    </div>
                </div>
                {previewDoc && <LicenseApplicationDoc data={previewDoc} onClose={() => setPreviewDoc(null)} />}
                {bioPdfPreview && <BioKnowledgeApplicationDoc data={bioPdfPreview} onClose={() => setBioPdfPreview(null)} />}
            </div>
        );
    }

    // ── Main form ───────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-parchment)', padding: '3rem 2rem' }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
                <button className="minimal-btn" style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }} onClick={() => navigate(-1)}>
                    ← {t('common.back', 'Back')}
                </button>

                <div className="framed-section" style={{ padding: '2rem' }}>
                    <h2 style={{ marginTop: 0 }}>{t('applyLicense.title', 'License Application')}</h2>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
                        {t('applyLicense.applyingFor', 'Applying for:')} <strong>{assetTitle}</strong>
                        {communityName && <span> — <em>{communityName}</em></span>}
                    </p>

                    {mediaUrl && (
                        <div style={{ marginBottom: '2rem' }}>
                            <RoleMediaPlayer
                                src={mediaUrl}
                                mode="preview"
                                assetId={assetType === 'SONIC' ? mediaFileId : assetId}
                                assetType={assetType as 'BIO' | 'SONIC'}
                                previewSeconds={30}
                                label={assetType === 'SONIC' ? `🎵 ${t('marketplace.sonicPreview', '30s Preview')}` : `🎙 ${t('marketplace.voiceSample', 'Voice Sample')}`}
                            />
                        </div>
                    )}

                    {/* License type selector */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                        {assetType === 'BIO' && (
                            <>
                                <button type="button" className={licenseType === 'RESEARCH' ? 'primary-btn' : 'minimal-btn'} onClick={() => setLicenseType('RESEARCH')}>
                                    🔬 {t('applyLicense.researchLicense', 'Research License')}
                                </button>
                                <button type="button" className={licenseType === 'COMMERCIAL' ? 'primary-btn' : 'minimal-btn'} onClick={() => setLicenseType('COMMERCIAL')}>
                                    🏢 {t('applyLicense.commercialLicense', 'Commercial License')}
                                </button>
                                <button type="button" className={licenseType === 'BIO_KNOWLEDGE' ? 'primary-btn' : 'minimal-btn'} onClick={() => setLicenseType('BIO_KNOWLEDGE')}>
                                    📜 Bio-Knowledge Application
                                </button>
                            </>
                        )}
                        {assetType === 'SONIC' && (
                            <button type="button" className="primary-btn">🎬 {t('applyLicense.mediaLicense', 'Media License')}</button>
                        )}
                    </div>

                    <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* ── Bio-Knowledge Application (has its own full layout) ── */}
                        {licenseType === 'BIO_KNOWLEDGE' ? (
                            <>
                                {/* Minimal identity header for Bio-Knowledge (no GST / org required) */}
                                <div style={{
                                    padding: '0.8rem 1rem',
                                    background: 'rgba(176,141,87,0.07)',
                                    border: '1px solid var(--color-muted-gold)',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    color: 'var(--color-burnt-umber)',
                                }}>👤 Applicant Identity</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                                        <input
                                            style={{ width: '100%', padding: '0.75rem', border: '1.5px solid var(--color-muted-gold)', borderRadius: '4px', background: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                            value={common.fullName}
                                            placeholder="e.g. Ramprasad Tekam"
                                            onChange={e => handleCommonChange('fullName', e.target.value)}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
                                        <input
                                            style={{ width: '100%', padding: '0.75rem', border: '1.5px solid var(--color-muted-gold)', borderRadius: '4px', background: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                            value={common.phone}
                                            placeholder="10-digit mobile"
                                            maxLength={10}
                                            onChange={e => handleCommonChange('phone', e.target.value.replace(/\D/g, ''))}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email Address</label>
                                        <input
                                            type="email"
                                            style={{ width: '100%', padding: '0.75rem', border: '1.5px solid var(--color-muted-gold)', borderRadius: '4px', background: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                            value={common.email}
                                            placeholder="optional"
                                            onChange={e => handleCommonChange('email', e.target.value)}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Organisation / Institution</label>
                                        <input
                                            style={{ width: '100%', padding: '0.75rem', border: '1.5px solid var(--color-muted-gold)', borderRadius: '4px', background: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                            value={common.organizationName}
                                            placeholder="optional (AYUSH clinic, NGO, etc.)"
                                            onChange={e => handleCommonChange('organizationName', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div style={{ borderTop: '1px dashed var(--color-muted-gold)' }} />
                                <BioKnowledgeLicenseForm
                                    data={bioData}
                                    onChange={updates => setBioData(prev => ({ ...prev, ...updates }))}
                                    evidenceFile={evidenceFile}
                                    onEvidenceFileChange={setEvidenceFile}
                                />
                            </>
                        ) : (
                            <>
                                {/* ── Common Identity Fields (Research/Commercial/Media) ── */}
                                <CommonApplicantFields
                                    fields={common}
                                    errors={commonErrors}
                                    touched={touched}
                                    docFile={docFile}
                                    onFieldChange={handleCommonChange}
                                    onFileChange={setDocFile}
                                    onBlur={handleBlur}
                                />

                                {/* ── License-type specific fields ── */}
                                {licenseType === 'RESEARCH' && <ResearchForm data={formData} onChange={handleFieldChange} />}
                                {licenseType === 'COMMERCIAL' && <CommercialForm data={formData} onChange={handleFieldChange} />}
                                {licenseType === 'MEDIA' && <MediaForm data={formData} onChange={handleFieldChange} />}
                            </>
                        )}

                        {/* Validation summary / Error bar */}
                        {!isFormValid && touched.size > 0 && licenseType !== 'BIO_KNOWLEDGE' && (
                            <div style={{
                                padding: '0.75rem 1rem',
                                background: 'rgba(239,68,68,0.06)',
                                border: '1px solid #fca5a5',
                                borderRadius: '4px',
                                fontSize: '0.82rem',
                                color: '#991b1b',
                            }}>
                                ⚠ {t('applyLicense.completeFieldsError', 'Please complete all required fields correctly before submitting.')}
                            </div>
                        )}

                        {error && (
                            <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid #ef4444', borderRadius: '4px', color: '#7f1d1d', fontSize: '0.85rem' }}>
                                ⚠ {error}
                            </div>
                        )}

                        {/* ── Footer: Preview + Submit ── */}
                        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--color-muted-gold)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ padding: '0.9rem 1.1rem', background: 'rgba(176,141,87,0.06)', border: '1px solid var(--color-muted-gold)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-burnt-umber)' }}>📄 {t('applyLicense.generateDoc', 'Generate Application Document')}</p>
                                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-text-light)' }}>{t('applyLicense.generateDocDesc', 'Preview and download a DHAROHAR-branded PDF before submitting.')}</p>
                                </div>
                                <button
                                    type="button"
                                    className="minimal-btn"
                                    style={{ fontSize: '0.82rem', flexShrink: 0 }}
                                    onClick={() => {
                                        if (licenseType === 'BIO_KNOWLEDGE') {
                                            setBioPdfPreview(buildBioDocData());
                                        } else {
                                            setPreviewDoc(buildDocData());
                                        }
                                    }}
                                >
                                    {t('applyLicense.previewDocBtn', 'Preview Document →')}
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="primary-btn"
                                disabled={isSubmitting || (licenseType !== 'BIO_KNOWLEDGE' && !isFormValid && touched.size > 0)}
                                style={{
                                    padding: '0.9rem',
                                    fontSize: '1rem',
                                    opacity: (licenseType !== 'BIO_KNOWLEDGE' && !isFormValid && touched.size > 0) ? 0.55 : 1,
                                    cursor: (licenseType !== 'BIO_KNOWLEDGE' && !isFormValid && touched.size > 0) ? 'not-allowed' : 'pointer',
                                    transition: 'opacity 200ms',
                                }}
                            >
                                {isSubmitting
                                    ? t('applyLicense.submitting', 'Submitting Application...')
                                    : licenseType === 'BIO_KNOWLEDGE'
                                        ? '📜 Submit Bio-Knowledge Application'
                                        : t('applyLicense.submitBtn', 'Submit License Application')
                                }
                            </button>

                            {!isFormValid && touched.size > 0 && licenseType !== 'BIO_KNOWLEDGE' && (
                                <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#dc2626', margin: 0 }}>
                                    {t('applyLicense.fieldsNeedAttention', '{{count}} field(s) need attention above ↑', { count: Object.keys(commonErrors).length })}
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {previewDoc && <LicenseApplicationDoc data={previewDoc} onClose={() => setPreviewDoc(null)} />}
            {bioPdfPreview && <BioKnowledgeApplicationDoc data={bioPdfPreview} onClose={() => setBioPdfPreview(null)} />}
        </div>
    );
};
