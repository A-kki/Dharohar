import { useRef } from 'react';
import './LicenseApplicationDoc.css'; // reuse existing styles
import type { BioKnowledgeFormData } from '../licenses/BioKnowledgeLicenseForm';

// ── Data types ────────────────────────────────────────────────────────────────

export interface BioKnowledgeDocData {
    // Applicant Identity (from common fields)
    applicantName: string;
    email: string;
    phone: string;
    // Asset / Community context
    assetTitle: string;
    communityName: string;
    signedDate: string;
    // All bio-knowledge specific fields
    bioDetails: BioKnowledgeFormData;
    evidenceFileName?: string;
}

interface Props {
    data: BioKnowledgeDocData;
    onClose: () => void;
}

// ── Helper: build the full printable HTML string ─────────────────────────────

const buildPrintHtml = (data: BioKnowledgeDocData, refNo: string): string => {
    const { bioDetails: b } = data;
    const safeHtml = (s?: string) => (s || '—').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const yesNo = (v: string) => v === 'yes' ? 'Yes' : v === 'no' ? 'No' : '—';

    return `<!DOCTYPE html>
<html>
<head>
  <title>DHAROHAR – Bio-Knowledge License Application – ${safeHtml(data.assetTitle)}</title>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; color: #2C2A29; background: #fff; font-size: 13px; }
    .doc-page { max-width: 780px; margin: 0 auto; padding: 40px 52px; }
    .doc-header { display: flex; align-items: center; gap: 20px; padding-bottom: 20px; border-bottom: 3px solid #A14B3B; margin-bottom: 28px; }
    .doc-header img { width: 66px; height: 66px; object-fit: contain; flex-shrink: 0; }
    .doc-header-text h1 { font-family: 'Playfair Display', serif; font-size: 26px; color: #A14B3B; letter-spacing: 2px; margin-bottom: 3px; }
    .doc-tagline { font-size: 11px; color: #B08D57; font-style: italic; letter-spacing: 0.5px; }
    .doc-header-right { margin-left: auto; text-align: right; font-size: 11px; color: #888; line-height: 1.6; }
    .doc-header-right strong { display: block; font-size: 13px; color: #2C2A29; }
    /* Title */
    .doc-title-block { text-align: center; margin-bottom: 28px; padding: 18px; background: #FAF8F5; border: 1px solid #E8D9C5; border-radius: 4px; }
    .doc-title-block h2 { font-family: 'Playfair Display', serif; font-size: 19px; color: #2C2A29; margin-bottom: 5px; }
    .doc-title-block p { font-size: 12px; color: #666; margin-bottom: 10px; }
    .doc-badge { display: inline-block; padding: 4px 18px; border-radius: 20px; background: #A14B3B; color: white; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
    /* Sacred flag */
    .sacred-flag { background: #FFF3CD; border: 1px solid #FFC107; border-radius: 4px; padding: 8px 12px; font-size: 11px; color: #664d03; margin-bottom: 16px; }
    /* Sections */
    .doc-section { margin-bottom: 22px; }
    .doc-section-title { font-family: 'Playfair Display', serif; font-size: 14px; color: #A14B3B; border-bottom: 1px solid #E8D9C5; padding-bottom: 5px; margin-bottom: 10px; }
    .doc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px 22px; }
    .doc-field label { display: block; font-size: 9.5px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
    .doc-field p { font-size: 12.5px; color: #2C2A29; border-bottom: 1px solid #E8D9C5; padding-bottom: 4px; min-height: 20px; }
    .doc-field.full { grid-column: 1 / -1; }
    .doc-field p.pre { white-space: pre-wrap; min-height: 50px; line-height: 1.6; }
    /* Tags */
    .tag-list { display: flex; flex-wrap: wrap; gap: 5px; padding-top: 2px; }
    .tag { display: inline-block; padding: 2px 9px; border-radius: 12px; background: rgba(161,75,59,0.1); border: 1px solid rgba(161,75,59,0.3); color: #A14B3B; font-size: 10.5px; font-weight: 500; }
    /* Declaration */
    .declaration { background: #FAF8F5; border: 1px solid #E8D9C5; padding: 14px; border-radius: 4px; font-size: 12px; color: #2C2A29; line-height: 1.75; margin-bottom: 22px; }
    /* Signatures */
    .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 28px; }
    .sig-block { border-top: 1px solid #2C2A29; padding-top: 8px; }
    .sig-block p { font-size: 11px; color: #888; line-height: 1.7; }
    .sig-block .sig-name { font-size: 12px; color: #2C2A29; font-weight: 600; margin-top: 36px; }
    /* Legal note */
    .legal-note { background: rgba(176,141,87,0.07); border-left: 3px solid #B08D57; padding: 10px 14px; font-size: 11px; color: #5a4a3a; font-style: italic; margin-bottom: 20px; border-radius: 0 4px 4px 0; }
    /* Footer */
    .doc-footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid #E8D9C5; text-align: center; font-size: 10px; color: #bbb; line-height: 1.7; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { margin: 0.7cm; } }
  </style>
</head>
<body>
  <div class="doc-page">

    <!-- Header -->
    <div class="doc-header">
      <img src="/logo.png" alt="DHAROHAR Logo" />
      <div class="doc-header-text">
        <h1>DHAROHAR</h1>
        <p class="doc-tagline">Safeguarding India's Wisdom with Digital Sovereignty</p>
      </div>
      <div class="doc-header-right">
        <strong>Bio-Knowledge License Application</strong>
        Ref: ${safeHtml(refNo)}<br>
        Date: ${safeHtml(data.signedDate)}
      </div>
    </div>

    <!-- Title -->
    <div class="doc-title-block">
      <h2>Bio-Knowledge Legislative License Application</h2>
      <p>Submitted for formal consideration under the DHAROHAR Governance Framework</p>
      <span class="doc-badge">🌿 Traditional / Indigenous Knowledge</span>
    </div>

    ${b.isSacredKnowledge === 'yes' ? `
    <div class="sacred-flag">
      ⚠️ <strong>SACRED / RESTRICTED KNOWLEDGE DECLARATION:</strong> The applicant has identified this knowledge as sacred or culturally restricted. Review Board must obtain explicit community council consent before any license approval.
    </div>` : ''}

    <!-- Part I: Applicant Personal Info -->
    <div class="doc-section">
      <h3 class="doc-section-title">Part I — Personal Information</h3>
      <div class="doc-grid">
        <div class="doc-field">
          <label>Full Name</label>
          <p>${safeHtml(data.applicantName)}</p>
        </div>
        <div class="doc-field">
          <label>Age</label>
          <p>${safeHtml(b.age)} years</p>
        </div>
        <div class="doc-field">
          <label>Gender</label>
          <p>${safeHtml(b.gender)}</p>
        </div>
        <div class="doc-field">
          <label>Phone Number</label>
          <p>${safeHtml(data.phone)}</p>
        </div>
        <div class="doc-field">
          <label>Email Address</label>
          <p>${safeHtml(data.email)}</p>
        </div>
        <div class="doc-field">
          <label>Aadhaar / Voter ID Ref.</label>
          <p>${safeHtml(b.aadhaarRef)}</p>
        </div>
        <div class="doc-field full">
          <label>Full Address</label>
          <p class="pre">${safeHtml(b.address)}</p>
        </div>
      </div>
    </div>

    <!-- Part II: Practice Details -->
    <div class="doc-section">
      <h3 class="doc-section-title">Part II — Practice Details</h3>
      <div class="doc-grid">
        <div class="doc-field">
          <label>Field of Specialisation</label>
          <p>${safeHtml(b.specialisation)}</p>
        </div>
        <div class="doc-field">
          <label>Years of Active Practice</label>
          <p>${safeHtml(b.yearsExperience)} years</p>
        </div>
        <div class="doc-field full">
          <label>Knowledge Domains Covered</label>
          <div class="tag-list">
            ${(b.knowledgeDomains || []).map(d => `<span class="tag">${safeHtml(d)}</span>`).join('') || '<p>—</p>'}
          </div>
        </div>
        <div class="doc-field full">
          <label>How Knowledge Was Acquired</label>
          <p class="pre">${safeHtml(b.acquisitionMethod)}</p>
        </div>
        <div class="doc-field full">
          <label>Description of Traditional Practice / Idea Being Licensed</label>
          <p class="pre">${safeHtml(b.practiceDescription)}</p>
        </div>
        <div class="doc-field">
          <label>Geographical Region of Practice</label>
          <p>${safeHtml(b.geographicalRegion)}</p>
        </div>
        <div class="doc-field">
          <label>Previously Documented?</label>
          <p>${yesNo(b.previouslyDocumented)}${b.previousDocRef ? ' — ' + safeHtml(b.previousDocRef) : ''}</p>
        </div>
      </div>
    </div>

    <!-- Part III: Source of Knowledge -->
    <div class="doc-section">
      <h3 class="doc-section-title">Part III — Source of Knowledge</h3>
      <div class="doc-grid">
        <div class="doc-field">
          <label>Source Type</label>
          <p>${safeHtml(b.sourceType)}</p>
        </div>
        <div class="doc-field">
          <label>Community / Tribe of Origin</label>
          <p>${safeHtml(b.communityOfOrigin)}</p>
        </div>
        <div class="doc-field full">
          <label>Knowledge Lineage / Transmission Chain</label>
          <p class="pre">${safeHtml(b.lineage)}</p>
        </div>
        <div class="doc-field">
          <label>Sacred / Restricted Knowledge</label>
          <p>${yesNo(b.isSacredKnowledge)}</p>
        </div>
        <div class="doc-field">
          <label>Supporting Evidence Uploaded</label>
          <p>${safeHtml(data.evidenceFileName)}</p>
        </div>
        <div class="doc-field full">
          <label>Existing Documentation / Publications</label>
          <p class="pre">${safeHtml(b.existingDocs)}</p>
        </div>
      </div>
    </div>

    <!-- Part IV: Community Status -->
    <div class="doc-section">
      <h3 class="doc-section-title">Part IV — Community Status</h3>
      <div class="doc-grid">
        <div class="doc-field">
          <label>Status / Role in Community</label>
          <p>${safeHtml(b.communityStatus)}</p>
        </div>
        <div class="doc-field">
          <label>Community Endorser</label>
          <p>${safeHtml(b.communityEndorsement)}</p>
        </div>
        <div class="doc-field full">
          <label>Recognition Type</label>
          <div class="tag-list">
            ${(b.recognitionType || []).map(r => `<span class="tag">${safeHtml(r)}</span>`).join('') || '<p>—</p>'}
          </div>
        </div>
        <div class="doc-field full">
          <label>Certifications / Official Recognitions</label>
          <p class="pre">${safeHtml(b.certifications)}</p>
        </div>
      </div>
    </div>

    <!-- Asset Details -->
    <div class="doc-section">
      <h3 class="doc-section-title">Part V — Knowledge Asset Reference</h3>
      <div class="doc-grid">
        <div class="doc-field">
          <label>Knowledge Asset Title</label>
          <p>${safeHtml(data.assetTitle)}</p>
        </div>
        <div class="doc-field">
          <label>Originating Community</label>
          <p>${safeHtml(data.communityName)}</p>
        </div>
      </div>
    </div>

    <!-- Legal Note -->
    <div class="legal-note">
      ⚖️ This application is governed by the <strong>Biological Diversity Act, 2002</strong> and the <strong>Nagoya Protocol on Access and Benefit Sharing</strong>. All traditional knowledge submitted through DHAROHAR is protected under national law. Unauthorized use or misappropriation of catalogued knowledge is a criminal offence.
    </div>

    <!-- Declaration -->
    <div class="doc-section">
      <h3 class="doc-section-title">Part VI — Declaration & Agreement</h3>
      <div class="declaration">
        I, <strong>${safeHtml(data.applicantName)}</strong>, hereby solemnly declare that all information provided in this Bio-Knowledge Legislative License Application is accurate, complete, and true to the best of my knowledge and belief. I affirm that I am a legitimate holder and/or custodian of the traditional knowledge described herein, and that I have the authority to submit this application on behalf of myself and my community.<br><br>
        I agree to abide by all terms and conditions of the DHAROHAR Governance Framework, including proper attribution to the <strong>${safeHtml(data.communityName || b.communityOfOrigin)}</strong> community, and timely cooperation with any verification or review process initiated by the Reviewer Board.<br><br>
        I understand that providing false information may result in rejection of this application, termination of any granted license, and potential legal action under the <strong>Biological Diversity Act, 2002</strong> and applicable Indian law.
      </div>
    </div>

    <!-- Signatures -->
    <div class="sig-grid">
      <div class="sig-block">
        <p>Applicant Signature</p>
        <p class="sig-name">${safeHtml(data.applicantName)}</p>
        <p>Date: ${safeHtml(data.signedDate)}</p>
        <p>${safeHtml(b.communityStatus)}</p>
      </div>
      <div class="sig-block">
        <p>For DHAROHAR Reviewer Board</p>
        <p style="margin-top:36px;">_________________________________</p>
        <p>Authorized Review Officer</p>
        <p>Date: ___________________</p>
        <p>Decision: ☐ Approved &nbsp;&nbsp; ☐ Rejected &nbsp;&nbsp; ☐ Needs Revision</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="doc-footer">
      <p>DHAROHAR — National Intangible Heritage Governance Platform &nbsp;|&nbsp; support@dharohar.gov.in</p>
      <p>This document is a formal Bio-Knowledge License Application. Approval is subject to Reviewer Board decision. © 2024 DHAROHAR</p>
    </div>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;
};

// ── Main Component ────────────────────────────────────────────────────────────

export const BioKnowledgeApplicationDoc = ({ data, onClose }: Props) => {
    const printRef = useRef<HTMLDivElement>(null);
    const refNo = `DHR-BIO-${Date.now().toString(36).toUpperCase()}`;

    const handlePrint = () => {
        const win = window.open('', '_blank', 'width=900,height=750');
        if (!win) return;
        win.document.write(buildPrintHtml(data, refNo));
        win.document.close();
    };

    const b = data.bioDetails;
    const yesNo = (v: string) => v === 'yes' ? 'Yes ✓' : v === 'no' ? 'No' : '—';

    return (
        <div className="lad-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="lad-modal">
                {/* Modal Header */}
                <div className="lad-modal-header">
                    <div>
                        <h3 className="lad-modal-title">📜 Bio-Knowledge Legislative Application</h3>
                        <p className="lad-modal-subtitle">Preview your formal application document before downloading</p>
                    </div>
                    <div className="lad-modal-actions">
                        <button type="button" className="lad-print-btn primary-btn" onClick={handlePrint}>
                            ⬇ Download / Print PDF
                        </button>
                        <button type="button" className="lad-close-btn" onClick={onClose} title="Close">✕</button>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="lad-preview-wrapper">
                    <div className="lad-preview-doc" ref={printRef}>

                        {/* Document Header */}
                        <div className="lad-doc-header">
                            <img src="/logo.png" alt="DHAROHAR" className="lad-logo" />
                            <div className="lad-brand">
                                <h1 className="lad-brand-name">DHAROHAR</h1>
                                <p className="lad-tagline">Safeguarding India's Wisdom with Digital Sovereignty</p>
                            </div>
                            <div className="lad-ref">
                                <span>Bio-Knowledge License Application</span>
                                <strong>Ref: {refNo}</strong>
                                <span>Date: {data.signedDate}</span>
                            </div>
                        </div>

                        {/* Title Block */}
                        <div className="lad-title-block">
                            <h2>Bio-Knowledge Legislative License Application</h2>
                            <p>Submitted for formal consideration under the DHAROHAR Governance Framework</p>
                            <span className="lad-type-badge" style={{ backgroundColor: '#A14B3B' }}>
                                🌿 Traditional / Indigenous Knowledge
                            </span>
                        </div>

                        {/* Sacred Knowledge Warning */}
                        {b.isSacredKnowledge === 'yes' && (
                            <div style={{
                                background: '#FFF3CD',
                                border: '1px solid #FFC107',
                                borderRadius: '4px',
                                padding: '10px 14px',
                                fontSize: '0.82rem',
                                color: '#664d03',
                                marginBottom: '1.25rem',
                                display: 'flex',
                                gap: '0.5rem',
                            }}>
                                ⚠️ <span><strong>SACRED / RESTRICTED KNOWLEDGE:</strong> The Reviewer Board must obtain explicit community council consent before any approval.</span>
                            </div>
                        )}

                        {/* Part I — Personal Info */}
                        <div className="lad-section">
                            <h3 className="lad-section-title">Part I — Personal Information</h3>
                            <div className="lad-fields-grid">
                                <div className="lad-field"><label>Full Name</label><p>{data.applicantName}</p></div>
                                <div className="lad-field"><label>Age</label><p>{b.age ? `${b.age} years` : '—'}</p></div>
                                <div className="lad-field"><label>Gender</label><p>{b.gender || '—'}</p></div>
                                <div className="lad-field"><label>Phone Number</label><p>{data.phone || '—'}</p></div>
                                <div className="lad-field"><label>Email Address</label><p>{data.email || '—'}</p></div>
                                <div className="lad-field"><label>Aadhaar / Voter ID Ref.</label><p>{b.aadhaarRef || '—'}</p></div>
                                <div className="lad-field lad-field--full">
                                    <label>Full Address</label>
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{b.address || '—'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Part II — Practice Details */}
                        <div className="lad-section">
                            <h3 className="lad-section-title">Part II — Practice Details</h3>
                            <div className="lad-fields-grid">
                                <div className="lad-field"><label>Field of Specialisation</label><p>{b.specialisation || '—'}</p></div>
                                <div className="lad-field"><label>Years of Active Practice</label><p>{b.yearsExperience ? `${b.yearsExperience} years` : '—'}</p></div>
                                <div className="lad-field lad-field--full">
                                    <label>Knowledge Domains Covered</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', paddingTop: '0.25rem' }}>
                                        {b.knowledgeDomains?.length
                                            ? b.knowledgeDomains.map(d => (
                                                <span key={d} style={{ padding: '2px 10px', borderRadius: '12px', background: 'rgba(161,75,59,0.1)', border: '1px solid rgba(161,75,59,0.3)', color: '#A14B3B', fontSize: '0.8rem', fontWeight: 500 }}>{d}</span>
                                            ))
                                            : <span>—</span>
                                        }
                                    </div>
                                </div>
                                <div className="lad-field lad-field--full">
                                    <label>How Knowledge Was Acquired</label>
                                    <p style={{ whiteSpace: 'pre-wrap', minHeight: '40px' }}>{b.acquisitionMethod || '—'}</p>
                                </div>
                                <div className="lad-field lad-field--full">
                                    <label>Description of Traditional Practice / Idea Being Licensed</label>
                                    <p style={{ whiteSpace: 'pre-wrap', minHeight: '60px' }}>{b.practiceDescription || '—'}</p>
                                </div>
                                <div className="lad-field"><label>Geographical Region of Practice</label><p>{b.geographicalRegion || '—'}</p></div>
                                <div className="lad-field">
                                    <label>Previously Documented?</label>
                                    <p>{yesNo(b.previouslyDocumented)}{b.previousDocRef ? ` — ${b.previousDocRef}` : ''}</p>
                                </div>
                            </div>
                        </div>

                        {/* Part III — Source of Knowledge */}
                        <div className="lad-section">
                            <h3 className="lad-section-title">Part III — Source of Knowledge</h3>
                            <div className="lad-fields-grid">
                                <div className="lad-field"><label>Source Type</label><p>{b.sourceType || '—'}</p></div>
                                <div className="lad-field"><label>Community / Tribe of Origin</label><p>{b.communityOfOrigin || '—'}</p></div>
                                <div className="lad-field lad-field--full">
                                    <label>Knowledge Lineage / Transmission Chain</label>
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{b.lineage || '—'}</p>
                                </div>
                                <div className="lad-field"><label>Sacred / Restricted Knowledge</label><p>{yesNo(b.isSacredKnowledge)}</p></div>
                                <div className="lad-field"><label>Evidence File Uploaded</label><p>{data.evidenceFileName || '—'}</p></div>
                                <div className="lad-field lad-field--full">
                                    <label>Existing Documentation / Publications</label>
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{b.existingDocs || '—'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Part IV — Community Status */}
                        <div className="lad-section">
                            <h3 className="lad-section-title">Part IV — Community Status</h3>
                            <div className="lad-fields-grid">
                                <div className="lad-field"><label>Status / Role in Community</label><p>{b.communityStatus || '—'}</p></div>
                                {/* <div className="lad-field"><label>Community Endorser</label><p>{b.communityEndorsement || '—'}</p></div> */}
                                <div className="lad-field lad-field--full">
                                    <label>Recognition Type</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', paddingTop: '0.25rem' }}>
                                        {b.recognitionType?.length
                                            ? b.recognitionType.map(r => (
                                                <span key={r} style={{ padding: '2px 10px', borderRadius: '12px', background: 'rgba(161,75,59,0.1)', border: '1px solid rgba(161,75,59,0.3)', color: '#A14B3B', fontSize: '0.8rem', fontWeight: 500 }}>{r}</span>
                                            ))
                                            : <span>—</span>
                                        }
                                    </div>
                                </div>
                                <div className="lad-field lad-field--full">
                                    <label>Certifications / Official Recognitions</label>
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{b.certifications || '—'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Part V — Asset Reference */}
                        <div className="lad-section">
                            <h3 className="lad-section-title">Part V — Knowledge Asset Reference</h3>
                            <div className="lad-fields-grid">
                                <div className="lad-field"><label>Knowledge Asset Title</label><p>{data.assetTitle}</p></div>
                                <div className="lad-field"><label>Originating Community</label><p>{data.communityName || b.communityOfOrigin || '—'}</p></div>
                            </div>
                        </div>

                        {/* Legal Note */}
                        <div style={{
                            background: 'rgba(176,141,87,0.07)',
                            borderLeft: '3px solid #B08D57',
                            padding: '10px 14px',
                            fontSize: '0.8rem',
                            color: '#5a4a3a',
                            fontStyle: 'italic',
                            marginBottom: '1.25rem',
                            borderRadius: '0 4px 4px 0',
                        }}>
                            ⚖️ This application is governed by the <strong>Biological Diversity Act, 2002</strong> and the <strong>Nagoya Protocol on Access and Benefit Sharing</strong>. All knowledge catalogued in DHAROHAR is protected under national law.
                        </div>

                        {/* Part VI — Declaration */}
                        <div className="lad-section">
                            <h3 className="lad-section-title">Part VI — Declaration & Agreement</h3>
                            <div className="lad-declaration">
                                I, <strong>{data.applicantName}</strong>, hereby solemnly declare that all information provided in this Bio-Knowledge Legislative License Application is accurate, complete, and true to the best of my knowledge. I affirm that I am a legitimate holder and/or custodian of the traditional knowledge described herein, and that I have the authority to submit this application on behalf of myself and my community.
                                <br /><br />
                                I agree to abide by all terms of the DHAROHAR Governance Framework, including proper attribution to the <strong>{data.communityName || b.communityOfOrigin}</strong> community, and full cooperation with any verification or review process.
                                <br /><br />
                                I understand that providing false information may result in rejection or termination of license, and legal action under the <strong>Biological Diversity Act, 2002</strong>.
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="lad-sig-grid">
                            <div className="lad-sig">
                                <div className="lad-sig-line" />
                                <p className="lad-sig-name">{data.applicantName}</p>
                                <p className="lad-sig-role">{b.communityStatus || 'Applicant'}</p>
                                <p className="lad-sig-date">Date: {data.signedDate}</p>
                            </div>
                            <div className="lad-sig">
                                <div className="lad-sig-line" />
                                <p className="lad-sig-name">Authorized Review Officer</p>
                                <p className="lad-sig-role">DHAROHAR Reviewer Board</p>
                                <p className="lad-sig-date">Date: ___________________</p>
                                <p className="lad-sig-date" style={{ marginTop: '6px' }}>
                                    Decision: ☐ Approved &nbsp; ☐ Rejected &nbsp; ☐ Revision
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="lad-doc-footer">
                            <p>DHAROHAR — National Intangible Heritage Governance Platform &nbsp;|&nbsp; support@dharohar.gov.in</p>
                            <p>This document is a formal Bio-Knowledge License Application. Approval is subject to Reviewer Board decision. © 2024 DHAROHAR</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
