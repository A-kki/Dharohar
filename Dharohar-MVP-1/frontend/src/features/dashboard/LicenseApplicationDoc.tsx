import { useRef } from 'react';
import './LicenseApplicationDoc.css';

export interface ApplicationData {
  applicantName: string;
  organizationName: string;
  email: string;
  phone: string;
  address: string;
  assetTitle: string;
  communityName: string;
  licenseType: string;
  purpose: string;
  duration: string;
  documentation: string;
  signedDate: string;
}

interface Props {
  data: ApplicationData;
  onClose: () => void;
}

const LICENSE_DETAILS: Record<string, {
  icon: string;
  color: string;
  fullTitle: string;
  permitted: string[];
  prohibited: string[];
  feeRange: string;
  communityBenefit: string;
  legalFramework: string;
}> = {
  RESEARCH: {
    icon: '🎓',
    color: '#4CAF50',
    fullTitle: 'Research License',
    permitted: [
      'Use in academic research and study',
      'Include in educational training programs',
      'Publish in scholarly papers with proper citation',
      'Use in thesis or dissertation work',
      'Present at academic conferences',
    ],
    prohibited: [
      'Cannot develop commercial products',
      'Cannot file patents claiming sole ownership',
      'Cannot sell, transfer, or monetize the knowledge',
      'Cannot sub-license to third parties',
    ],
    feeRange: '₹10,000 – ₹1,00,000 per year',
    communityBenefit: '80% of license fee goes directly to the originating community',
    legalFramework: 'Protected under the Biological Diversity Act, 2002',
  },
  COMMERCIAL: {
    icon: '💼',
    color: '#FF9800',
    fullTitle: 'Commercial License',
    permitted: [
      'Develop commercial products for sale and distribution',
      'Manufacture and distribute products based on the knowledge',
      'Use in marketing and branding (with attribution)',
      'File patents (with benefit-sharing agreement)',
      'Export products internationally',
    ],
    prohibited: [
      'Cannot claim sole ownership of traditional knowledge',
      'Cannot underreport sales or avoid royalty payments',
      'Cannot misrepresent the origin of the knowledge',
      'Cannot transfer license without written approval',
    ],
    feeRange: '₹2,00,000 – ₹50,00,000 one-time + 3–5% royalties',
    communityBenefit: '80% of upfront fee and 80% of ongoing royalties go directly to the community',
    legalFramework: 'Governed by the Biological Diversity Act, 2002 & Nagoya Protocol',
  },
  MEDIA: {
    icon: '🎬',
    color: '#9C27B0',
    fullTitle: 'Media License',
    permitted: [
      'Use as background music in films, TV shows, and documentaries',
      'Include in web series and streaming platforms',
      'Theatrical and festival screenings',
      'Use in promotional trailers and teasers',
    ],
    prohibited: [
      'Cannot alter lyrics or melody without community approval',
      'Cannot use in political campaigns or offensive content',
      'Cannot claim ownership of the music',
      'Cannot sample or extract portions without explicit approval',
    ],
    feeRange: '₹25,000 – ₹10,00,000 + ₹0.50 per 1,000 streams',
    communityBenefit: '80% of all fees and royalties go directly to the community',
    legalFramework: "Protected under the Copyright Act, 1957 & Performers' Rights",
  },
  MUSIC: {
    icon: '🎵',
    color: '#F44336',
    fullTitle: 'Commercial Music License',
    permitted: [
      'Digital streaming on all major platforms',
      'Include in commercial albums and compilations',
      'Public performances and concerts',
      'Radio broadcasting',
      'Create remixes with prior community approval',
    ],
    prohibited: [
      'Cannot alter sacred or ceremonial musical elements',
      'Cannot claim sole authorship of the composition',
      'Cannot avoid royalty payments to the community',
      'Cannot sub-license without written permission',
    ],
    feeRange: '₹1,00,000 – ₹20,00,000 + 10–15% of revenue',
    communityBenefit: '80% of upfront fee and 80% of ongoing royalties go directly to the community',
    legalFramework: 'Governed by the Copyright Act, 1957 & IPRS Regulations',
  },
};

export const LicenseApplicationDoc = ({ data, onClose }: Props) => {
  const printRef = useRef<HTMLDivElement>(null);
  const lic = LICENSE_DETAILS[data.licenseType] || LICENSE_DETAILS['RESEARCH'];

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;

    win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>DHAROHAR – License Application – ${data.assetTitle}</title>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      color: #2C2A29;
      background: #fff;
      font-size: 13px;
    }
    .doc-page {
      max-width: 780px;
      margin: 0 auto;
      padding: 48px 56px;
    }
    /* Header */
    .doc-header {
      display: flex;
      align-items: center;
      gap: 20px;
      padding-bottom: 24px;
      border-bottom: 3px solid #A14B3B;
      margin-bottom: 32px;
    }
    .doc-header img {
      width: 70px;
      height: 70px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .doc-header-text h1 {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      color: #A14B3B;
      letter-spacing: 2px;
      margin-bottom: 4px;
    }
    .doc-tagline {
      font-size: 11px;
      color: #B08D57;
      font-style: italic;
      letter-spacing: 0.5px;
    }
    .doc-header-right {
      margin-left: auto;
      text-align: right;
    }
    .doc-ref {
      font-size: 10px;
      color: #888;
    }
    .doc-ref strong {
      display: block;
      font-size: 13px;
      color: #2C2A29;
      margin-bottom: 2px;
    }
    /* Title */
    .doc-title-block {
      text-align: center;
      margin-bottom: 32px;
      padding: 20px;
      background: #FAF8F5;
      border: 1px solid #E8D9C5;
      border-radius: 4px;
    }
    .doc-title-block h2 {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      color: #2C2A29;
      margin-bottom: 6px;
    }
    .doc-license-badge {
      display: inline-block;
      padding: 4px 16px;
      border-radius: 20px;
      color: white;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    /* Sections */
    .doc-section {
      margin-bottom: 24px;
    }
    .doc-section-title {
      font-family: 'Playfair Display', serif;
      font-size: 14px;
      color: #A14B3B;
      border-bottom: 1px solid #E8D9C5;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }
    .doc-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 24px;
    }
    .doc-field label {
      display: block;
      font-size: 10px;
      font-weight: 600;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }
    .doc-field p {
      font-size: 13px;
      color: #2C2A29;
      border-bottom: 1px solid #E8D9C5;
      padding-bottom: 4px;
      min-height: 22px;
    }
    .doc-field.full { grid-column: 1 / -1; }
    /* Lists */
    .doc-list {
      list-style: none;
      padding: 0;
    }
    .doc-list li {
      font-size: 12px;
      padding: 5px 0 5px 18px;
      position: relative;
      border-bottom: 1px dotted #E8D9C5;
      color: #2C2A29;
      line-height: 1.5;
    }
    .doc-list li:before {
      content: '•';
      position: absolute;
      left: 4px;
      font-weight: 700;
    }
    .doc-list.permitted li:before { color: #4CAF50; }
    .doc-list.prohibited li:before { color: #D32F2F; }
    /* Benefit box */
    .benefit-box {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 16px;
      background: #FAF8F5;
      border: 2px solid #B08D57;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .benefit-pct {
      font-family: 'Playfair Display', serif;
      font-size: 2.2rem;
      font-weight: 700;
      color: #A14B3B;
      line-height: 1;
    }
    .benefit-text strong {
      display: block;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #5a4a3a;
      margin-bottom: 4px;
    }
    .benefit-text p {
      font-size: 12px;
      color: #2C2A29;
    }
    /* Fee */
    .fee-box {
      padding: 12px 16px;
      background: #FAF8F5;
      border-left: 4px solid ${lic.color};
      margin-bottom: 8px;
      border-radius: 0 4px 4px 0;
    }
    .fee-amount {
      font-size: 16px;
      font-weight: 700;
      color: ${lic.color};
    }
    .fee-note { font-size: 11px; color: #888; margin-top: 2px; }
    /* Declaration */
    .declaration {
      background: #FAF8F5;
      border: 1px solid #E8D9C5;
      padding: 16px;
      border-radius: 4px;
      font-size: 12px;
      color: #2C2A29;
      line-height: 1.7;
      margin-bottom: 24px;
    }
    /* Signature */
    .sig-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 32px;
    }
    .sig-block { border-top: 1px solid #2C2A29; padding-top: 8px; }
    .sig-block p { font-size: 11px; color: #888; }
    /* Footer */
    .doc-footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #E8D9C5;
      text-align: center;
      font-size: 10px;
      color: #aaa;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { margin: 0.8cm; }
    }
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
        <div class="doc-ref">
          <strong>License Application</strong>
          Ref: DHR-${Date.now().toString(36).toUpperCase()}<br/>
          Date: ${data.signedDate}
        </div>
      </div>
    </div>

    <!-- Application Title -->
    <div class="doc-title-block">
      <h2>License Application Form</h2>
      <p style="font-size:12px; color:#666; margin-bottom:10px;">Submitted for formal consideration under the DHAROHAR Governance Framework</p>
      <span class="doc-license-badge" style="background: ${lic.color};">
        ${lic.icon} ${lic.fullTitle}
      </span>
    </div>

    <!-- Part 1: Asset Info -->
    <div class="doc-section">
      <h3 class="doc-section-title">Part I — Cultural Asset Details</h3>
      <div class="doc-grid">
        <div class="doc-field">
          <label>Asset Title</label>
          <p>${data.assetTitle}</p>
        </div>
        <div class="doc-field">
          <label>Community of Origin</label>
          <p>${data.communityName}</p>
        </div>
        <div class="doc-field full">
          <label>License Type Requested</label>
          <p>${lic.fullTitle}</p>
        </div>
      </div>
    </div>

    <!-- Part 2: Applicant Info -->
    <div class="doc-section">
      <h3 class="doc-section-title">Part II — Applicant Details</h3>
      <div class="doc-grid">
        <div class="doc-field">
          <label>Applicant Name</label>
          <p>${data.applicantName}</p>
        </div>
        <div class="doc-field">
          <label>Organization / Institution</label>
          <p>${data.organizationName || '—'}</p>
        </div>
        <div class="doc-field">
          <label>Email Address</label>
          <p>${data.email}</p>
        </div>
        <div class="doc-field">
          <label>Phone</label>
          <p>${data.phone || '—'}</p>
        </div>
        <div class="doc-field full">
          <label>Full Address</label>
          <p>${data.address || '—'}</p>
        </div>
      </div>
    </div>

    <!-- Part 3: Purpose -->
    <div class="doc-section">
      <h3 class="doc-section-title">Part III — Purpose & Scope</h3>
      <div class="doc-grid">
        <div class="doc-field full">
          <label>Stated Purpose of License</label>
          <p style="white-space: pre-wrap; min-height: 60px;">${data.purpose}</p>
        </div>
        <div class="doc-field">
          <label>Requested Duration</label>
          <p>${data.duration}</p>
        </div>
        <div class="doc-field">
          <label>Supporting Documentation</label>
          <p>${data.documentation || '—'}</p>
        </div>
      </div>
    </div>

    <!-- Part 4: License Terms -->
    <div class="doc-section">
      <h3 class="doc-section-title">Part IV — License Terms & Conditions</h3>

      <div style="margin-bottom: 14px;">
        <p style="font-size:12px; font-weight:600; color:#2C2A29; margin-bottom:8px;">✅ Permitted Uses under this License:</p>
        <ul class="doc-list permitted">
          ${lic.permitted.map(p => `<li>${p}</li>`).join('')}
        </ul>
      </div>

      <div style="margin-bottom: 14px;">
        <p style="font-size:12px; font-weight:600; color:#2C2A29; margin-bottom:8px;">🚫 Restrictions — The Following are Strictly Prohibited:</p>
        <ul class="doc-list prohibited">
          ${lic.prohibited.map(p => `<li>${p}</li>`).join('')}
        </ul>
      </div>
    </div>

    <!-- Part 5: Fees & Community Benefit -->
    <div class="doc-section">
      <h3 class="doc-section-title">Part V — Fee Structure & Community Benefit</h3>

      <div class="fee-box">
        <p class="fee-amount">${lic.feeRange}</p>
        <p class="fee-note">Final fee determined by DHAROHAR Admin based on scope and institution size.</p>
      </div>

      <div class="benefit-box">
        <div class="benefit-pct">80%</div>
        <div class="benefit-text">
          <strong>🏘️ Community Benefit Share</strong>
          <p>${lic.communityBenefit}</p>
        </div>
      </div>

      <p style="font-size:11px; color:#888; font-style:italic;">${lic.legalFramework}</p>
    </div>

    <!-- Declaration -->
    <div class="doc-section">
      <h3 class="doc-section-title">Part VI — Declaration & Agreement</h3>
      <div class="declaration">
        I, <strong>${data.applicantName}</strong>, on behalf of <strong>${data.organizationName || 'myself'}</strong>, hereby declare that all information provided in this application is accurate and complete to the best of my knowledge. I agree to abide by all terms and conditions of the <strong>${lic.fullTitle}</strong> as governed by the DHAROHAR framework, including proper attribution to the <strong>${data.communityName}</strong> community and timely payment of any applicable fees and royalties. I understand that any misuse of the licensed knowledge may result in immediate termination of the license and legal action under applicable Indian law.
      </div>
    </div>

    <!-- Signatures -->
    <div class="sig-grid">
      <div class="sig-block">
        <p>Applicant Signature</p>
        <p style="margin-top: 40px;">_________________________________</p>
        <p>${data.applicantName}</p>
        <p>Date: ${data.signedDate}</p>
      </div>
      <div class="sig-block">
        <p>For DHAROHAR Governance Authority</p>
        <p style="margin-top: 40px;">_________________________________</p>
        <p>Authorized Officer</p>
        <p>Date: ___________________</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="doc-footer">
      <p>DHAROHAR — National Intangible Heritage Governance Platform &nbsp;|&nbsp; support@dharohar.gov.in</p>
      <p>This document is for formal record-keeping. Approval is subject to admin review. © 2024 DHAROHAR</p>
    </div>
  </div>
  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`);
    win.document.close();
  };

  return (
    <div className="lad-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lad-modal">
        {/* Modal Header */}
        <div className="lad-modal-header">
          <div>
            <h3 className="lad-modal-title">📄 License Application Document</h3>
            <p className="lad-modal-subtitle">Preview before downloading as PDF</p>
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
                <span>License Application</span>
                <strong>Ref: DHR-{Date.now().toString(36).toUpperCase()}</strong>
                <span>Date: {data.signedDate}</span>
              </div>
            </div>

            {/* Title block */}
            <div className="lad-title-block">
              <h2>License Application Form</h2>
              <p>Submitted for formal consideration under the DHAROHAR Governance Framework</p>
              <span className="lad-type-badge" style={{ backgroundColor: lic.color }}>
                {lic.icon} {lic.fullTitle}
              </span>
            </div>

            {/* Part I */}
            <div className="lad-section">
              <h3 className="lad-section-title">Part I — Cultural Asset Details</h3>
              <div className="lad-fields-grid">
                <div className="lad-field">
                  <label>Asset Title</label>
                  <p>{data.assetTitle}</p>
                </div>
                <div className="lad-field">
                  <label>Community of Origin</label>
                  <p>{data.communityName}</p>
                </div>
                <div className="lad-field lad-field--full">
                  <label>License Type Requested</label>
                  <p>{lic.fullTitle}</p>
                </div>
              </div>
            </div>

            {/* Part II */}
            <div className="lad-section">
              <h3 className="lad-section-title">Part II — Applicant Details</h3>
              <div className="lad-fields-grid">
                <div className="lad-field">
                  <label>Applicant Name</label>
                  <p>{data.applicantName}</p>
                </div>
                <div className="lad-field">
                  <label>Organization / Institution</label>
                  <p>{data.organizationName || '—'}</p>
                </div>
                <div className="lad-field">
                  <label>Email Address</label>
                  <p>{data.email}</p>
                </div>
                <div className="lad-field">
                  <label>Phone</label>
                  <p>{data.phone || '—'}</p>
                </div>
                <div className="lad-field lad-field--full">
                  <label>Full Address</label>
                  <p>{data.address || '—'}</p>
                </div>
              </div>
            </div>

            {/* Part III */}
            <div className="lad-section">
              <h3 className="lad-section-title">Part III — Purpose & Scope</h3>
              <div className="lad-fields-grid">
                <div className="lad-field lad-field--full">
                  <label>Stated Purpose of License</label>
                  <p style={{ whiteSpace: 'pre-wrap', minHeight: '60px' }}>{data.purpose}</p>
                </div>
                <div className="lad-field">
                  <label>Requested Duration</label>
                  <p>{data.duration}</p>
                </div>
                <div className="lad-field">
                  <label>Supporting Documentation</label>
                  <p>{data.documentation || '—'}</p>
                </div>
              </div>
            </div>

            {/* Part IV: Terms */}
            <div className="lad-section">
              <h3 className="lad-section-title">Part IV — License Terms & Conditions</h3>
              <div className="lad-terms-col">
                <p className="lad-list-heading lad-green">✅ Permitted Uses</p>
                <ul className="lad-terms-list lad-terms-list--permit">
                  {lic.permitted.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="lad-terms-col" style={{ marginTop: '1rem' }}>
                <p className="lad-list-heading lad-red">🚫 Strictly Prohibited</p>
                <ul className="lad-terms-list lad-terms-list--prohibit">
                  {lic.prohibited.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>

            {/* Part V: Fees */}
            <div className="lad-section">
              <h3 className="lad-section-title">Part V — Fee Structure & Community Benefit</h3>
              <div className="lad-fee-box" style={{ borderLeftColor: lic.color }}>
                <span className="lad-fee-amount" style={{ color: lic.color }}>{lic.feeRange}</span>
                <span className="lad-fee-note">Final fee set by DHAROHAR Admin based on scope and institution size.</span>
              </div>
              <div className="lad-benefit-box">
                <div className="lad-benefit-pct" style={{ color: lic.color }}>
                  {data.licenseType === 'RESEARCH' ? '80%' : data.licenseType === 'COMMERCIAL' ? '80%' : '80%'}
                </div>
                <div>
                  <strong className="lad-benefit-label">🏘️ Community Benefit Share</strong>
                  <p className="lad-benefit-text">{lic.communityBenefit}</p>
                </div>
              </div>
              <p className="lad-legal">⚖️ {lic.legalFramework}</p>
            </div>

            {/* Part VI: Declaration */}
            <div className="lad-section">
              <h3 className="lad-section-title">Part VI — Declaration & Agreement</h3>
              <div className="lad-declaration">
                I, <strong>{data.applicantName}</strong>, on behalf of <strong>{data.organizationName || 'myself'}</strong>, hereby declare that all information provided in this application is accurate and complete to the best of my knowledge. I agree to abide by all terms and conditions of the <strong>{lic.fullTitle}</strong> as governed by the DHAROHAR framework, including proper attribution to the <strong>{data.communityName}</strong> community and timely payment of any applicable fees and royalties. I understand that any misuse may result in immediate termination and legal action under applicable Indian law.
              </div>
            </div>

            {/* Signatures */}
            <div className="lad-sig-grid">
              <div className="lad-sig">
                <div className="lad-sig-line" />
                <p className="lad-sig-name">{data.applicantName}</p>
                <p className="lad-sig-role">Applicant</p>
                <p className="lad-sig-date">Date: {data.signedDate}</p>
              </div>
              <div className="lad-sig">
                <div className="lad-sig-line" />
                <p className="lad-sig-name">Authorized Officer</p>
                <p className="lad-sig-role">DHAROHAR Governance Authority</p>
                <p className="lad-sig-date">Date: ___________________</p>
              </div>
            </div>

            {/* Footer */}
            <div className="lad-doc-footer">
              <p>DHAROHAR — National Intangible Heritage Governance Platform &nbsp;|&nbsp; support@dharohar.gov.in</p>
              <p>This document is a formal license application. Approval is subject to admin review. © 2024 DHAROHAR</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
