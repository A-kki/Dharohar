import { useRef, useState } from 'react';

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

// ── Sub-components ────────────────────────────────────────────────────────────

const Field = ({
    label, required, hint, children,
}: {
    label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) => (
    <div style={fieldWrap}>
        <label style={labelStyle}>
            {label}{required && <span style={reqStar}>*</span>}
        </label>
        {children}
        {hint && <span style={{ fontSize: '0.76rem', color: 'var(--color-text-light)' }}>{hint}</span>}
    </div>
);

// ── Constants ─────────────────────────────────────────────────────────────────

const KNOWLEDGE_DOMAINS = [
    'Medicinal Plants & Herbs',
    'Wound Healing & Surgery',
    'Dietary & Nutritional Practices',
    'Rituals & Ceremonial Practices',
    'Agricultural & Soil Knowledge',
    'Textile & Craft Techniques',
    'Animal Husbandry',
    'Water & Environmental Knowledge',
    'Astrology & Calendar Systems',
    'Other',
];

const RECOGNITION_TYPES = [
    'Self-Identified',
    'Peer Recognised',
    'Government Certified',
    'Community Elected',
    'NGO Documented',
    'Gram Sabha Recognised',
];

// ── Tag Selector ──────────────────────────────────────────────────────────────

const TagSelector = ({
    options, selected, onToggle,
}: {
    options: string[]; selected: string[]; onToggle: (val: string) => void;
}) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {options.map(opt => {
            const active = selected.includes(opt);
            return (
                <button
                    key={opt}
                    type="button"
                    onClick={() => onToggle(opt)}
                    style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        border: `1.5px solid ${active ? 'var(--color-burnt-umber)' : 'var(--color-muted-gold)'}`,
                        background: active ? 'var(--color-burnt-umber)' : 'white',
                        color: active ? 'white' : 'var(--color-text-main)',
                        fontSize: '0.8rem',
                        fontWeight: active ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                    }}
                >
                    {active ? '✓ ' : ''}{opt}
                </button>
            );
        })}
    </div>
);

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BioKnowledgeFormData {
    // Part I
    age: string;
    gender: string;
    address: string;
    aadhaarRef: string;

    // Part II
    specialisation: string;
    knowledgeDomains: string[];
    yearsExperience: string;
    acquisitionMethod: string;
    practiceDescription: string;
    geographicalRegion: string;
    previouslyDocumented: 'yes' | 'no' | '';
    previousDocRef: string;

    // Part III
    sourceType: string;
    lineage: string;
    communityOfOrigin: string;
    isSacredKnowledge: 'yes' | 'no' | '';
    existingDocs: string;

    // Part IV
    communityStatus: string;
    recognitionType: string[];
    certifications: string;
    communityEndorsement: string;
}

export const defaultBioKnowledgeData: BioKnowledgeFormData = {
    age: '', gender: '', address: '', aadhaarRef: '',
    specialisation: '', knowledgeDomains: [], yearsExperience: '',
    acquisitionMethod: '', practiceDescription: '', geographicalRegion: '',
    previouslyDocumented: '', previousDocRef: '',
    sourceType: '', lineage: '', communityOfOrigin: '', isSacredKnowledge: '',
    existingDocs: '',
    communityStatus: '', recognitionType: [], certifications: '',
    communityEndorsement: '',
};

// ── Step meta ─────────────────────────────────────────────────────────────────

const STEPS = [
    { number: 1, emoji: '👤', title: 'Personal Information', subtitle: 'Identity details of the applicant' },
    { number: 2, emoji: '🌿', title: 'Practice Details', subtitle: 'Domain, expertise and the knowledge being licensed' },
    { number: 3, emoji: '📜', title: 'Source of Knowledge', subtitle: 'Provenance, lineage and transmission details' },
    { number: 4, emoji: '🏘️', title: 'Community Status', subtitle: 'Recognition and standing within your community' },
];

// ── Component Props ───────────────────────────────────────────────────────────

interface Props {
    data: BioKnowledgeFormData;
    onChange: (updates: Partial<BioKnowledgeFormData>) => void;
    evidenceFile: File | null;
    onEvidenceFileChange: (f: File | null) => void;
    // Wizard exposes current page so parent can optionally know
    onPageChange?: (page: number) => void;
}

// ── Main Component ────────────────────────────────────────────────────────────

export const BioKnowledgeLicenseForm = ({
    data, onChange, evidenceFile, onEvidenceFileChange, onPageChange,
}: Props) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageErrors, setPageErrors] = useState<string[]>([]);
    const [confirmed, setConfirmed] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const set = (field: keyof BioKnowledgeFormData, value: string) =>
        onChange({ [field]: value } as Partial<BioKnowledgeFormData>);

    const toggleDomain = (val: string) => {
        const next = data.knowledgeDomains.includes(val)
            ? data.knowledgeDomains.filter(d => d !== val)
            : [...data.knowledgeDomains, val];
        onChange({ knowledgeDomains: next });
    };

    const toggleRecognition = (val: string) => {
        const next = data.recognitionType.includes(val)
            ? data.recognitionType.filter(r => r !== val)
            : [...data.recognitionType, val];
        onChange({ recognitionType: next });
    };

    // ── Per-page validation ───────────────────────────────────────────────────

    const validatePage = (page: number): string[] => {
        const errs: string[] = [];
        if (page === 1) {
            if (!data.age || parseInt(data.age) < 18) errs.push('Age must be 18 or above.');
            if (!data.gender) errs.push('Gender is required.');
            if (data.address.trim().length < 10) errs.push('Please provide a full address (village, district, state, PIN).');
        }
        if (page === 2) {
            if (!data.specialisation) errs.push('Field of specialisation is required.');
            if (data.knowledgeDomains.length === 0) errs.push('Select at least one knowledge domain.');
            if (!data.yearsExperience) errs.push('Years of experience is required.');
            if (data.acquisitionMethod.trim().length < 15) errs.push('Please describe how you acquired this knowledge (min 15 characters).');
            if (data.practiceDescription.trim().length < 50) errs.push('Practice description must be at least 50 characters.');
            if (data.geographicalRegion.trim().length < 3) errs.push('Geographical region is required.');
        }
        if (page === 3) {
            if (!data.sourceType) errs.push('Source type is required.');
            if (data.communityOfOrigin.trim().length < 2) errs.push('Community / tribe of origin is required.');
            if (!data.isSacredKnowledge) errs.push('Please indicate if this is sacred / restricted knowledge.');
        }
        if (page === 4) {
            if (!data.communityStatus) errs.push('Community status / role is required.');
            if (data.recognitionType.length === 0) errs.push('Select at least one recognition type.');
        }
        return errs;
    };

    const goNext = () => {
        const errs = validatePage(currentPage);
        if (errs.length > 0) { setPageErrors(errs); return; }
        setPageErrors([]);
        const next = Math.min(currentPage + 1, 4);
        setCurrentPage(next);
        onPageChange?.(next);
    };

    const goBack = () => {
        setPageErrors([]);
        const prev = Math.max(currentPage - 1, 1);
        setCurrentPage(prev);
        onPageChange?.(prev);
    };

    // ── Styles ────────────────────────────────────────────────────────────────

    const stepBarItem = (step: typeof STEPS[0]) => {
        const done = step.number < currentPage;
        const active = step.number === currentPage;
        return (
            <div
                key={step.number}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    position: 'relative',
                    cursor: done ? 'pointer' : 'default',
                }}
                onClick={() => {
                    if (done) { setPageErrors([]); setCurrentPage(step.number); onPageChange?.(step.number); }
                }}
            >
                {/* connector line */}
                {step.number < 4 && (
                    <div style={{
                        position: 'absolute',
                        top: '18px',
                        left: '50%',
                        width: '100%',
                        height: '2px',
                        background: done ? 'var(--color-burnt-umber)' : 'var(--color-muted-gold)',
                        transition: 'background 300ms ease',
                        zIndex: 0,
                    }} />
                )}
                {/* circle */}
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: done ? '1rem' : '0.8rem',
                    fontWeight: 700,
                    border: `2px solid ${active ? 'var(--color-burnt-umber)' : done ? 'var(--color-burnt-umber)' : 'var(--color-muted-gold)'}`,
                    background: active ? 'var(--color-burnt-umber)' : done ? 'rgba(161,75,59,0.12)' : 'white',
                    color: active ? 'white' : done ? 'var(--color-burnt-umber)' : 'var(--color-text-light)',
                    transition: 'all 300ms ease',
                    position: 'relative',
                    zIndex: 1,
                    flexShrink: 0,
                    boxShadow: active ? '0 0 0 4px rgba(161,75,59,0.15)' : 'none',
                }}>
                    {done ? '✓' : step.number}
                </div>
                {/* label */}
                <span style={{
                    marginTop: '6px',
                    fontSize: '0.7rem',
                    fontWeight: active ? 700 : 500,
                    color: active ? 'var(--color-burnt-umber)' : done ? 'var(--color-text-main)' : 'var(--color-text-light)',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    maxWidth: '70px',
                }}>
                    {step.emoji} {step.title.split(' ')[0]}
                </span>
            </div>
        );
    };

    const sectionTitle = (emoji: string, title: string, subtitle: string) => (
        <div style={{
            padding: '0.85rem 1rem',
            background: 'rgba(161,75,59,0.06)',
            border: '1px solid rgba(161,75,59,0.25)',
            borderRadius: '6px',
            marginBottom: '0.25rem',
        }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-burnt-umber)', letterSpacing: '0.02em' }}>
                {emoji} {title}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                {subtitle}
            </div>
        </div>
    );

    // ── Pages ─────────────────────────────────────────────────────────────────

    const renderPage1 = () => (
        <section>
            {sectionTitle('👤', 'Part I — Personal Information', 'Basic identity details of the applicant / practitioner')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingTop: '1rem' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label="Age" required hint="Must be 18 or above">
                        <input style={baseInput} type="number" min={18} max={110} value={data.age}
                            placeholder="e.g. 52" onChange={e => set('age', e.target.value)} />
                    </Field>
                    <Field label="Gender" required>
                        <select style={baseInput} value={data.gender} onChange={e => set('gender', e.target.value)}>
                            <option value="">Select gender…</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                            <option>Prefer not to say</option>
                        </select>
                    </Field>
                </div>

                <Field label="Full Address" required hint="Village/Town, District, State, PIN Code">
                    <textarea
                        style={{ ...baseInput, minHeight: '80px', resize: 'vertical' }}
                        value={data.address}
                        placeholder="e.g. Gram Mohanpur, Dist. Mandla, Madhya Pradesh – 481661"
                        onChange={e => set('address', e.target.value)}
                    />
                </Field>

                <Field label="Aadhaar / Voter ID Reference" hint="Optional — last 4 digits for identity verification">
                    <input style={baseInput} value={data.aadhaarRef}
                        placeholder="e.g. XXXX-XXXX-3456 or VID-ABC1234"
                        onChange={e => set('aadhaarRef', e.target.value)} />
                </Field>
            </div>
        </section>
    );

    const renderPage2 = () => (
        <section>
            {sectionTitle('🌿', 'Part II — Practice Details', 'Describe the practitioner\'s domain, expertise and the knowledge being licensed')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingTop: '1rem' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label="Field of Specialisation" required>
                        <select style={baseInput} value={data.specialisation} onChange={e => set('specialisation', e.target.value)}>
                            <option value="">Select specialisation…</option>
                            <option>Ayurveda</option>
                            <option>Siddha Medicine</option>
                            <option>Unani Medicine</option>
                            <option>Naturopathy & Yoga</option>
                            <option>Folk / Tribal Medicine</option>
                            <option>Herbal Remedies</option>
                            <option>Traditional Surgery (Shalyatantra)</option>
                            <option>Agricultural Knowledge</option>
                            <option>Textile & Craft Traditions</option>
                            <option>Environmental & Water Knowledge</option>
                            <option>Ritual & Ceremonial Knowledge</option>
                            <option>Other</option>
                        </select>
                    </Field>
                    <Field label="Years of Active Practice" required>
                        <input style={baseInput} type="number" min={0} max={80}
                            value={data.yearsExperience} placeholder="e.g. 25"
                            onChange={e => set('yearsExperience', e.target.value)} />
                    </Field>
                </div>

                <Field label="Knowledge Domains Covered" required hint="Select all that apply">
                    <TagSelector options={KNOWLEDGE_DOMAINS} selected={data.knowledgeDomains} onToggle={toggleDomain} />
                </Field>

                <Field label="How did you acquire this knowledge?" required>
                    <textarea style={{ ...baseInput, minHeight: '80px', resize: 'vertical' }}
                        value={data.acquisitionMethod}
                        placeholder="e.g. Passed down from my grandmother over 15 years of apprenticeship..."
                        onChange={e => set('acquisitionMethod', e.target.value)} />
                </Field>

                <Field label="Description of the Traditional Practice / Idea Being Licensed" required
                    hint="The core knowledge, remedy, method, or practice you are submitting for licensing (minimum 50 characters)">
                    <textarea style={{ ...baseInput, minHeight: '130px', resize: 'vertical' }}
                        value={data.practiceDescription}
                        placeholder="Describe in detail the specific knowledge, preparation method, practice, or technique you wish to license..."
                        onChange={e => set('practiceDescription', e.target.value)} />
                </Field>

                <Field label="Geographical Region of Practice" required hint="State and District where this practice is primarily observed">
                    <input style={baseInput} value={data.geographicalRegion}
                        placeholder="e.g. Bastar District, Chhattisgarh"
                        onChange={e => set('geographicalRegion', e.target.value)} />
                </Field>

                <Field label="Has this practice been documented or published before?">
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {(['yes', 'no'] as const).map(val => (
                            <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input type="radio" name="previouslyDocumented" value={val}
                                    checked={data.previouslyDocumented === val}
                                    onChange={() => set('previouslyDocumented', val)} />
                                {val.charAt(0).toUpperCase() + val.slice(1)}
                            </label>
                        ))}
                    </div>
                    {data.previouslyDocumented === 'yes' && (
                        <input style={{ ...baseInput, marginTop: '0.5rem' }}
                            value={data.previousDocRef}
                            placeholder="Reference / publication link or description..."
                            onChange={e => set('previousDocRef', e.target.value)} />
                    )}
                </Field>
            </div>
        </section>
    );

    const renderPage3 = () => (
        <section>
            {sectionTitle('📜', 'Part III — Source of Knowledge', 'Provenance, lineage and transmission details of the knowledge')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingTop: '1rem' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label="Source Type" required>
                        <select style={baseInput} value={data.sourceType} onChange={e => set('sourceType', e.target.value)}>
                            <option value="">Select source type…</option>
                            <option>Oral Tradition (Inter-generational)</option>
                            <option>Written Manuscripts / Texts</option>
                            <option>Community Practice (Collective)</option>
                            <option>Personal Research & Observation</option>
                            <option>Guru-Shishya Parampara</option>
                            <option>Temple / Religious Institution</option>
                            <option>Other</option>
                        </select>
                    </Field>
                    <Field label="Community / Tribe of Origin" required>
                        <input style={baseInput} value={data.communityOfOrigin}
                            placeholder="e.g. Gond Tribe, Kuruba Community..."
                            onChange={e => set('communityOfOrigin', e.target.value)} />
                    </Field>
                </div>

                <Field label="Knowledge Lineage / Transmission Chain" hint="Optional — how the knowledge was passed to you across generations">
                    <textarea style={{ ...baseInput, minHeight: '70px', resize: 'vertical' }}
                        value={data.lineage}
                        placeholder="e.g. Great-grandfather → Grandfather → Father → Self (practising since 1997)"
                        onChange={e => set('lineage', e.target.value)} />
                </Field>

                <Field label="Is this Sacred or Restricted Knowledge?" required>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.25rem' }}>
                        {(['yes', 'no'] as const).map(val => (
                            <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input type="radio" name="isSacredKnowledge" value={val}
                                    checked={data.isSacredKnowledge === val}
                                    onChange={() => set('isSacredKnowledge', val)} />
                                {val.charAt(0).toUpperCase() + val.slice(1)}
                            </label>
                        ))}
                    </div>
                    {data.isSacredKnowledge === 'yes' && (
                        <div style={{
                            padding: '0.75rem 1rem', background: 'rgba(234,179,8,0.08)',
                            border: '1px solid #ca8a04', borderRadius: '6px',
                            fontSize: '0.82rem', color: '#713f12',
                            display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                        }}>
                            <span>⚠️</span>
                            <span>
                                <strong>Sacred / Restricted Knowledge Flagged.</strong> The Reviewer Board will be alerted and will require explicit community council consent before approving any license. This does not automatically prevent licensing — it adds a mandatory additional review step.
                            </span>
                        </div>
                    )}
                </Field>

                <Field label="Evidence / Supporting Material" hint="Optional — upload a PDF (max 5 MB): manuscripts, certificates, photographs, government records">
                    <div
                        onClick={() => fileRef.current?.click()}
                        style={{
                            border: '1.5px dashed var(--color-muted-gold)',
                            borderRadius: '4px', padding: '1rem 1.25rem', cursor: 'pointer',
                            background: evidenceFile ? 'rgba(22,163,74,0.04)' : 'rgba(176,141,87,0.04)',
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                        }}
                    >
                        <span style={{ fontSize: '1.4rem' }}>{evidenceFile ? '📄' : '📎'}</span>
                        <div style={{ flex: 1 }}>
                            {evidenceFile ? (
                                <>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#16a34a' }}>{evidenceFile.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{(evidenceFile.size / 1024 / 1024).toFixed(2)} MB</div>
                                </>
                            ) : (
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                                    Click to select a PDF file <span style={{ fontSize: '0.78rem' }}>(optional)</span>
                                </div>
                            )}
                        </div>
                        {evidenceFile && (
                            <button type="button"
                                onClick={e => { e.stopPropagation(); onEvidenceFileChange(null); if (fileRef.current) fileRef.current.value = ''; }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1rem' }}>✕</button>
                        )}
                    </div>
                    <input ref={fileRef} type="file" accept="application/pdf" style={{ display: 'none' }}
                        onChange={e => onEvidenceFileChange(e.target.files?.[0] || null)} />
                </Field>

                <Field label="Any Existing Documentation or Publications?" hint="Optional — books, papers, government records mentioning this practice">
                    <textarea style={{ ...baseInput, minHeight: '60px', resize: 'vertical' }}
                        value={data.existingDocs}
                        placeholder="e.g. Mentioned in 'Tribal Medicine of Central India' (1982, ICAR)..."
                        onChange={e => set('existingDocs', e.target.value)} />
                </Field>
            </div>
        </section>
    );

    const renderPage4 = () => (
        <section>
            {sectionTitle('🏘️', 'Part IV — Community Status', 'Recognition and standing of the practitioner within their community')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingTop: '1rem' }}>

                <Field label="Status / Role in Community" required>
                    <select style={baseInput} value={data.communityStatus} onChange={e => set('communityStatus', e.target.value)}>
                        <option value="">Select community status…</option>
                        <option>Locally Recognised Expert (Informal)</option>
                        <option>Registered Hakim (Unani)</option>
                        <option>AYUSH Practitioner (Government Registered)</option>
                        <option>Registered Vaidya (Ayurveda)</option>
                        <option>Gram Sabha Representative</option>
                        <option>Tribal / Panchayat Council Member</option>
                        <option>Traditional Midwife (Dai)</option>
                        <option>Ritual / Ceremonial Specialist</option>
                        <option>Community Elder / Knowledge Keeper</option>
                        <option>Other</option>
                    </select>
                </Field>

                <Field label="Recognition Type" required hint="Select all that apply">
                    <TagSelector options={RECOGNITION_TYPES} selected={data.recognitionType} onToggle={toggleRecognition} />
                </Field>

                <Field label="Certifications / Official Recognitions" hint="Optional — AYUSH registration number, government certificates, NGO documentation, etc.">
                    <textarea style={{ ...baseInput, minHeight: '70px', resize: 'vertical' }}
                        value={data.certifications}
                        placeholder="e.g. AYUSH Registration No. MP/AYU/2014/00432 or Gram Sabha Resolution dated 12/03/2019..."
                        onChange={e => set('certifications', e.target.value)} />
                </Field>

                <Field label="Community Endorsement" hint="Optional — name and role of a community elder or institution endorsing this application">
                    <input style={baseInput} value={data.communityEndorsement}
                        placeholder="e.g. Shri Ramprasad Tekam, Sarpanch, Gram Panchayat Mohanpur"
                        onChange={e => set('communityEndorsement', e.target.value)} />
                </Field>

                {/* Divider */}
                <div style={{ borderTop: '1px dashed var(--color-muted-gold)', marginTop: '0.5rem' }} />

                {/* Legal notice */}
                <div style={{
                    padding: '0.9rem 1.1rem', background: 'rgba(176,141,87,0.06)',
                    border: '1px solid var(--color-muted-gold)', borderRadius: '6px',
                    fontSize: '0.8rem', color: 'var(--color-text-light)', lineHeight: 1.7,
                }}>
                    ⚖️ <strong style={{ color: 'var(--color-text-main)' }}>Legal Framework:</strong> This application is submitted under the <strong>DHAROHAR Governance Framework</strong>, in compliance with the <strong>Biological Diversity Act, 2002</strong> and the <strong>Nagoya Protocol on Access and Benefit Sharing</strong>. All information provided is subject to verification by the Reviewer Board.
                </div>

                {/* ── Confirmation Checkbox ── */}
                <div style={{
                    padding: '1.1rem 1.25rem',
                    background: confirmed ? 'rgba(22,163,74,0.05)' : 'rgba(239,68,68,0.04)',
                    border: `1.5px solid ${confirmed ? '#22c55e' : '#fca5a5'}`,
                    borderRadius: '6px',
                    transition: 'all 200ms ease',
                }}>
                    <label style={{
                        display: 'flex', gap: '0.85rem', alignItems: 'flex-start',
                        cursor: 'pointer', lineHeight: 1.65,
                    }}>
                        <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={e => setConfirmed(e.target.checked)}
                            style={{
                                width: '18px', height: '18px',
                                marginTop: '2px', cursor: 'pointer', flexShrink: 0,
                                accentColor: 'var(--color-burnt-umber)',
                            }}
                        />
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', fontWeight: 500 }}>
                            <strong>Declaration & Confirmation:</strong> I hereby solemnly declare that all information provided in this Bio-Knowledge Legislative License Application is <strong>accurate, complete, and true</strong> to the best of my knowledge and belief. I confirm that I am a legitimate holder and/or custodian of the traditional knowledge described herein, and that I have the authority to submit this application on behalf of myself and my community.
                            <br /><br />
                            I agree to abide by all terms of the <strong>DHAROHAR Governance Framework</strong>, including proper attribution, compliance with the benefit-sharing arrangement stated above, and full cooperation with any verification or review process initiated by the Reviewer Board.
                            <br /><br />
                            I understand that providing <strong>false or incomplete information</strong> may result in rejection of this application, termination of any granted license, and potential legal action under the <strong>Biological Diversity Act, 2002</strong> and applicable Indian law.
                        </span>
                    </label>
                    {confirmed && (
                        <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: '#14532d', fontWeight: 600 }}>
                            ✅ Declaration accepted — you may now submit the application.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );

    // ── Render ────────────────────────────────────────────────────────────────

    const step = STEPS[currentPage - 1];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

            {/* Step progress bar */}
            <div style={{
                padding: '1.25rem 1rem 0.75rem',
                background: 'rgba(176,141,87,0.04)',
                border: '1px solid var(--color-muted-gold)',
                borderRadius: '8px',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Step {currentPage} of {STEPS.length}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-burnt-umber)', fontWeight: 700 }}>
                        {step.emoji} {step.title}
                    </span>
                </div>
                {/* thin progress track */}
                <div style={{ height: '4px', background: 'rgba(176,141,87,0.2)', borderRadius: '2px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <div style={{
                        height: '100%',
                        width: `${(currentPage / 4) * 100}%`,
                        background: 'var(--color-burnt-umber)',
                        borderRadius: '2px',
                        transition: 'width 400ms ease',
                    }} />
                </div>
                {/* circles */}
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    {STEPS.map(s => stepBarItem(s))}
                </div>
            </div>

            {/* Page subtitle */}
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', fontStyle: 'italic', marginTop: '-0.75rem' }}>
                {step.subtitle}
            </div>

            {/* Page content */}
            <div style={{ animation: 'fadeIn 200ms ease' }}>
                {currentPage === 1 && renderPage1()}
                {currentPage === 2 && renderPage2()}
                {currentPage === 3 && renderPage3()}
                {currentPage === 4 && renderPage4()}
            </div>

            {/* Validation errors */}
            {pageErrors.length > 0 && (
                <div style={{
                    padding: '0.85rem 1rem',
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid #fca5a5',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    color: '#991b1b',
                }}>
                    <strong>Please fix the following before continuing:</strong>
                    <ul style={{ margin: '0.4rem 0 0 1.2rem', padding: 0 }}>
                        {pageErrors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                </div>
            )}

            {/* Navigation buttons */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '0.5rem',
                borderTop: '1px dashed var(--color-muted-gold)',
            }}>
                <button
                    type="button"
                    className="minimal-btn"
                    onClick={goBack}
                    disabled={currentPage === 1}
                    style={{ opacity: currentPage === 1 ? 0.35 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                    ← Back
                </button>

                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
                    {currentPage < 4
                        ? `${4 - currentPage} more step${4 - currentPage > 1 ? 's' : ''} remaining`
                        : 'Final step'
                    }
                </span>

                {currentPage < 4 ? (
                    <button type="button" className="primary-btn" onClick={goNext}>
                        Next →
                    </button>
                ) : (
                    /* On page 4, expose the confirmed state via a data attribute so ApplyForLicense can gate submit */
                    <span data-bio-confirmed={confirmed ? 'true' : 'false'} style={{ display: 'none' }} />
                )}
            </div>

            {/* Expose confirmed to parent via hidden input for gating */}
            <input type="hidden" name="bioConfirmed" value={confirmed ? 'true' : 'false'} />

            {/* Expose confirmed as prop via CSS custom property trick — simpler: we return it via callback */}
            {/* Actually we expose it via a ref-forwarded state — handled below */}
        </div>
    );
};

// ── Export confirmed state check helper for parent use ────────────────────────

export const isBioConfirmed = (formEl: HTMLFormElement | null): boolean => {
    if (!formEl) return false;
    const input = formEl.querySelector<HTMLInputElement>('input[name="bioConfirmed"]');
    return input?.value === 'true';
};
