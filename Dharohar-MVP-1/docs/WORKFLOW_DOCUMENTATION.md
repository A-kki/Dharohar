# DHAROHAR WORKFLOW DOCUMENTATION

## Complete User Journey & System Flow

---

## TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [User Roles](#user-roles)
3. [Workflow 1: Community Upload (BIO Heritage)](#workflow-1-community-upload-bio-heritage)
4. [Workflow 2: Community Upload (SONIC Heritage)](#workflow-2-community-upload-sonic-heritage)
5. [Workflow 3: Review Board Approval](#workflow-3-review-board-approval)
6. [Workflow 4: Public Explorer](#workflow-4-public-explorer)
7. [Workflow 5: License Application](#workflow-5-license-application)
8. [Workflow 6: Admin License Approval](#workflow-6-admin-license-approval)
9. [Complete System Flow Diagram](#complete-system-flow-diagram)
10. [Data Flow & Storage](#data-flow--storage)

---

## SYSTEM OVERVIEW

Dharohar is a government-backed infrastructure for:
- **Capturing** tribal bio-heritage knowledge and folk music
- **Documenting** it with legal and cultural metadata
- **Reviewing** submissions through authorized board
- **Licensing** approved content for commercial/research use
- **Protecting** indigenous intellectual property rights

---

## USER ROLES

| Role | Description | Access Level |
|------|-------------|--------------|
| **Community (Client)** | Tribal community representatives | Upload bio/sonic data, track submissions, view licenses |
| **Review Board** | Authorized reviewers (Government body in production) | Review pending submissions, approve/reject with feedback |
| **General User** | Media houses, pharma companies, music labels, researchers, citizens | Browse approved content, apply for licenses |
| **Admin** | System administrator | Manage licensing, set fees, approve license requests, generate agreements |

---

## WORKFLOW 1: COMMUNITY UPLOAD (BIO HERITAGE)

### Purpose
Capture oral traditional knowledge (medicinal practices, agricultural wisdom, cultural rituals, etc.)

### Step-by-Step Process

#### 1.1 Community Login
- Each tribal community has **ONE shared login credential**
- Login authenticates as `role: community`

#### 1.2 Select Upload Type
- User selects: **"BIO Heritage Knowledge"**

#### 1.3 Record Voice Input
```
User Interface:
┌─────────────────────────────────┐
│  🎤 Record Bio Heritage         │
│                                 │
│  [Start Recording] [Stop]       │
│  Duration: 00:00                │
│                                 │
│  Or Upload Audio File: [Browse] │
└─────────────────────────────────┘
```

#### 1.4 Automatic Processing
System performs:

**a) Audio Transcription**
- Converts speech to text using speech-to-text engine
- Supports regional languages
- Stores original audio + transcript

**b) Metadata Capture**
- **Geo-location data**: GPS coordinates of recording location
- **Timestamp**: Date and time of recording
- **Device metadata**: Recording device info

**c) Community Information Form**
```
Required Fields:
├── Title of Knowledge
├── Name of Recordee (person speaking)
├── Community Name
├── Cultural Identity/Tribe
├── Recording Location (Auto + Manual entry)
├── Description/Summary
├── Category (Medicinal/Agricultural/Ritual/etc.)
└── Language Used
```

#### 1.5 Legal Documentation Generation
System auto-generates:

**Formal Documentation Structure:**
```
DHAROHAR BIO-HERITAGE DOCUMENTATION
═══════════════════════════════════

KNOWLEDGE RECORD ID: BIO-2024-XXXX

1. CULTURAL IDENTITY
   - Community: [Name]
   - Tribe/Group: [Identity]
   - Custodian: [Recordee Name]

2. KNOWLEDGE DETAILS
   - Title: [Knowledge Title]
   - Category: [Type]
   - Description: [Summary]
   - Language: [Regional Language]
   - Transcript: [Full Text]

3. RECORDING METADATA
   - Date Recorded: [DD-MM-YYYY]
   - Location: [GPS + Place Name]
   - Duration: [MM:SS]

4. LEGAL FRAMEWORK (As per Indian Law)
   - Copyright Ownership: [Community Name]
   - Protected under: Biological Diversity Act, 2002
   - Traditional Knowledge Digital Library (TKDL) Compliant
   - Sui Generis Rights: Community Intellectual Rights

5. LICENSING TERMS (Pending Approval)
   - Research Use: Subject to approval
   - Commercial Use: Subject to approval and benefit-sharing
   - Attribution: Mandatory
   - Geographic Restrictions: As per community consent

6. CONSENT & VERIFICATION
   - Community Consent: Given
   - Review Status: PENDING
   - Approval Date: [Awaiting]
```

#### 1.6 Submission Status
- **Status**: `PENDING`
- Notification sent to Review Board
- Community dashboard shows: "Submission Under Review"

---

## WORKFLOW 2: COMMUNITY UPLOAD (SONIC HERITAGE)

### Purpose
Capture traditional folk music, tunes, and cultural songs

### Step-by-Step Process

#### 2.1 Community Login
- Same shared community credentials

#### 2.2 Select Upload Type
- User selects: **"SONIC Heritage (Music/Folklore)"**

#### 2.3 Upload Audio File
```
User Interface:
┌─────────────────────────────────┐
│  🎵 Upload Folk Music           │
│                                 │
│  [Select Audio File]            │
│  Supported: MP3, WAV, FLAC      │
│                                 │
│  Or Record Live: [🎤 Record]    │
└─────────────────────────────────┘
```

#### 2.4 Record Community Details
```
Required Fields:
├── Song/Music Title
├── Type (Folk Song/Instrumental/Chant/etc.)
├── Community Name
├── Cultural Significance (Description)
├── Traditional Occasion (Festival/Ritual/Daily)
├── Instruments Used
├── Performers/Artists
├── Language/Dialect
└── Recording Location
```

#### 2.5 Automatic Processing

**a) Audio Fingerprinting**
- Generate unique acoustic fingerprint
- Store fingerprint for copyright protection
- Enable plagiarism detection

**b) Metadata Extraction**
- Audio format, bitrate, duration
- Spectral analysis (for future comparison)

**c) Geo-tagging**
- GPS coordinates
- Region/District/State

**d) Storage**
- Original audio file stored securely
- Compressed version for preview
- Metadata JSON stored in database

#### 2.6 Legal Documentation Generation
```
DHAROHAR SONIC HERITAGE DOCUMENTATION
═════════════════════════════════════

MUSIC RECORD ID: SONIC-2024-XXXX

1. CULTURAL IDENTITY
   - Community: [Name]
   - Region: [Location]
   - Performers: [Names]

2. MUSICAL DETAILS
   - Title: [Song Name]
   - Type: [Folk/Classical/etc.]
   - Language: [Dialect]
   - Instruments: [List]
   - Duration: [MM:SS]
   - Cultural Context: [Description]

3. RECORDING METADATA
   - Date Recorded: [DD-MM-YYYY]
   - Location: [GPS + Place Name]
   - Audio Fingerprint: [Hash]
   - Format: [Type]

4. LEGAL FRAMEWORK
   - Copyright Ownership: [Community Name]
   - Protected under: Copyright Act, 1957
   - Neighboring Rights: Community holds rights
   - Performance Rights: Community controlled

5. LICENSING TERMS (Pending Approval)
   - Media Use: Subject to licensing
   - Commercial Use: Requires agreement
   - Sampling Rights: Restricted
   - Attribution: Mandatory
   - Revenue Sharing: As per agreement

6. FINGERPRINT VERIFICATION
   - Acoustic Signature: [Stored]
   - Uniqueness Score: [Calculated]
   - Prior Art Check: [Status]
```

#### 2.7 Submission Status
- **Status**: `PENDING`
- Awaiting Review Board approval

---

## WORKFLOW 3: REVIEW BOARD APPROVAL

### Purpose
Authorized review and validation of submitted heritage content

### Important Note
> **FOR PROTOTYPE**: Review Board is a demonstration role
> 
> **IN PRODUCTION**: This will be an official **Government Body** (e.g., National Biodiversity Authority, Ministry of Tribal Affairs, TKDL Committee)

### Step-by-Step Process

#### 3.1 Review Board Login
- Role: `review`
- Access to Review Dashboard

#### 3.2 Review Dashboard
```
┌──────────────────────────────────────────────┐
│  PENDING SUBMISSIONS                         │
├──────────────────────────────────────────────┤
│                                              │
│  📄 BIO-2024-0123                           │
│  Title: Neem Medicinal Uses                 │
│  Community: Gond Tribe                      │
│  Submitted: 2024-02-28                      │
│  [👁 Review] [✓ Approve] [✗ Reject]        │
│                                              │
│  🎵 SONIC-2024-0045                         │
│  Title: Harvest Festival Song               │
│  Community: Santhal Tribe                   │
│  Submitted: 2024-02-27                      │
│  [👁 Review] [✓ Approve] [✗ Reject]        │
│                                              │
└──────────────────────────────────────────────┘
```

#### 3.3 Review Process

**For BIO Heritage:**
- Read full transcript
- Listen to original audio
- Verify community details
- Check legal documentation
- Assess cultural sensitivity
- Verify authenticity

**For SONIC Heritage:**
- Listen to complete audio
- Review cultural context
- Verify community ownership
- Check for prior conflicts
- Assess commercial potential

#### 3.4 Decision Options

**Option A: APPROVE**
```
Action Required:
├── Click "Approve"
├── Add Reviewer Comments (optional)
└── Assign Risk Tier:
    ├── LOW (General knowledge)
    ├── MODERATE (Sensitive practices)
    └── HIGH (Sacred/restricted knowledge)
```

**System Actions on Approval:**
1. Status changes to: `APPROVED`
2. License generation activated
3. Content becomes visible in Public Explorer
4. Community notified: "Submission Approved"

**Option B: REJECT**
```
Action Required:
├── Click "Reject"
├── Add Feedback (MANDATORY)
└── Specify Reason:
    ├── Insufficient documentation
    ├── Authenticity concerns
    ├── Legal issues
    ├── Duplicate content
    └── Other (specify)
```

**System Actions on Rejection:**
1. Status changes to: `REJECTED`
2. Feedback sent to community
3. Community can resubmit with corrections

#### 3.5 License Seal Generation
Upon approval, system generates:

```
═══════════════════════════════════════════
        DHAROHAR APPROVAL SEAL
═══════════════════════════════════════════

Asset ID: [BIO/SONIC-XXXX]
Approved By: Review Board
Date: [DD-MM-YYYY]
Seal Number: [SEAL-XXXX]

This heritage asset has been verified and
approved for inclusion in the National
Heritage Knowledge Repository.

Licensing: Available upon application
Protected under: Indian Heritage Laws

         [DIGITAL SIGNATURE]
     Government of India Emblem
═══════════════════════════════════════════
```

---

## WORKFLOW 4: PUBLIC EXPLORER

### Purpose
Allow general users to discover and explore approved heritage content

### User Types
- Media houses
- Pharmaceutical companies
- Music labels
- Research institutions
- Educational bodies
- General citizens

### Step-by-Step Process

#### 4.1 Public Access (No Login Required for Browsing)
- Anyone can visit Public Explorer
- No authentication needed to browse

#### 4.2 Explorer Interface
```
┌───────────────────────────────────────────┐
│  🌳 DHAROHAR PUBLIC EXPLORER              │
├───────────────────────────────────────────┤
│                                           │
│  [Three.js 3D Knowledge Tree]             │
│                                           │
│  Interactive 3D visualization of          │
│  communities and their heritage           │
│                                           │
│  Click on nodes to explore content        │
└───────────────────────────────────────────┘
```

#### 4.3 Browse Categories
```
Filter By:
├── Type: BIO | SONIC
├── Community
├── Region/State
├── Cultural Category
└── Risk Tier
```

#### 4.4 View Heritage Card (LIMITED INFO)

**BIO Heritage Preview:**
```
┌─────────────────────────────────────┐
│  📄 Traditional Neem Remedies       │
├─────────────────────────────────────┤
│  Community: Gond Tribe              │
│  Region: Madhya Pradesh             │
│  Category: Medicinal Knowledge      │
│  Risk Tier: LOW                     │
│                                     │
│  Cultural Summary:                  │
│  Traditional knowledge of neem's    │
│  medicinal properties passed down   │
│  through generations...             │
│                                     │
│  📊 Available for Licensing         │
│                                     │
│  [🔒 Apply for License]             │
└─────────────────────────────────────┘
```

**SONIC Heritage Preview:**
```
┌─────────────────────────────────────┐
│  🎵 Harvest Celebration Song        │
├─────────────────────────────────────┤
│  Community: Santhal Tribe           │
│  Region: Jharkhand                  │
│  Type: Folk Song                    │
│  Duration: 3:24                     │
│                                     │
│  🎧 [30-second Preview Clip]        │
│                                     │
│  Cultural Context:                  │
│  Sung during annual harvest         │
│  festival celebrating abundance...  │
│                                     │
│  📊 Available for Licensing         │
│                                     │
│  [🔒 Apply for License]             │
└─────────────────────────────────────┘
```

#### 4.5 Information Restrictions
**PUBLIC CANNOT SEE:**
- ❌ Full transcript (BIO)
- ❌ Complete audio file (SONIC - only preview)
- ❌ Detailed metadata
- ❌ Recordee personal information
- ❌ Exact GPS coordinates
- ❌ Audio fingerprint
- ❌ Legal documentation details

**PUBLIC CAN SEE:**
- ✅ Title and summary
- ✅ Community name
- ✅ General region
- ✅ Cultural category
- ✅ Risk tier
- ✅ License availability status

---

## WORKFLOW 5: LICENSE APPLICATION

### Purpose
Allow interested parties to apply for legal use of heritage content

### Step-by-Step Process

#### 5.1 User Registration Required
- General user must create account
- Role: `general`
- Provide: Name, Email, Organization, Purpose

#### 5.2 Click "Apply for License"
Opens application form

#### 5.3 License Application Form

**For BIO Heritage:**
```
┌─────────────────────────────────────────┐
│  LICENSE APPLICATION                    │
│  Asset: BIO-2024-0123                   │
├─────────────────────────────────────────┤
│                                         │
│  License Type:                          │
│  ○ RESEARCH USE                         │
│     - Academic institutions             │
│     - Research bodies                   │
│     - Training purposes                 │
│     - Non-commercial study              │
│                                         │
│  ○ COMMERCIAL USE                       │
│     - Pharmaceutical companies          │
│     - Product development               │
│     - Commercial exploitation           │
│     - Profit-making ventures            │
│                                         │
│  Applicant Details:                     │
│  Name: _________________________        │
│  Organization: __________________       │
│  Type: [Dropdown]                       │
│                                         │
│  Purpose of Use (Detailed):             │
│  ________________________________       │
│  ________________________________       │
│                                         │
│  Intended Duration:                     │
│  ○ 1 Year  ○ 3 Years  ○ 5 Years        │
│                                         │
│  [Submit Application]                   │
└─────────────────────────────────────────┘
```

**For SONIC Heritage:**
```
┌─────────────────────────────────────────┐
│  LICENSE APPLICATION                    │
│  Asset: SONIC-2024-0045                 │
├─────────────────────────────────────────┤
│                                         │
│  License Type:                          │
│  ○ MEDIA USE                            │
│     - Films/TV/Documentaries            │
│     - Advertising                       │
│     - Background score                  │
│                                         │
│  ○ COMMERCIAL MUSIC                     │
│     - Music labels                      │
│     - Streaming platforms               │
│     - Remixes/Adaptations               │
│     - Public performances               │
│                                         │
│  Applicant Details:                     │
│  Name: _________________________        │
│  Organization: __________________       │
│  Type: [Media House/Label/etc.]         │
│                                         │
│  Purpose of Use:                        │
│  ________________________________       │
│                                         │
│  Usage Scope:                           │
│  ☐ Sampling allowed                     │
│  ☐ Adaptation allowed                   │
│  ☐ Public performance                   │
│  ☐ Digital distribution                 │
│                                         │
│  Intended Duration:                     │
│  ○ 1 Year  ○ 3 Years  ○ Perpetual      │
│                                         │
│  [Submit Application]                   │
└─────────────────────────────────────────┘
```

#### 5.4 Application Submitted
- Status: `PENDING`
- Application ID generated
- Admin notified
- Applicant receives confirmation email

#### 5.5 Applicant Dashboard
User can track:
```
MY LICENSE APPLICATIONS
├── Application #LIC-001
│   Status: PENDING
│   Asset: Traditional Neem Remedies
│   Applied: 2024-03-01
│   Type: COMMERCIAL USE
│
└── Application #LIC-002
    Status: APPROVED ✓
    Asset: Harvest Song
    Applied: 2024-02-25
    Type: MEDIA USE
    [View Agreement] [Download]
```

---

## WORKFLOW 6: ADMIN LICENSE APPROVAL

### Purpose
Admin reviews, prices, and approves/rejects license applications

### Step-by-Step Process

#### 6.1 Admin Login
- Role: `admin`
- Access to Admin Dashboard

#### 6.2 View Pending License Applications
```
┌──────────────────────────────────────────────┐
│  LICENSE REQUESTS                            │
├──────────────────────────────────────────────┤
│                                              │
│  📋 LIC-2024-001                            │
│  Asset: BIO-2024-0123 (Neem Knowledge)      │
│  Applicant: ABC Pharma Ltd.                 │
│  Type: COMMERCIAL USE                       │
│  Duration: 3 Years                          │
│  [Review] [Approve] [Reject]                │
│                                              │
│  📋 LIC-2024-002                            │
│  Asset: SONIC-2024-0045 (Harvest Song)     │
│  Applicant: XYZ Films                       │
│  Type: MEDIA USE                            │
│  Duration: 1 Year                           │
│  [Review] [Approve] [Reject]                │
│                                              │
└──────────────────────────────────────────────┘
```

#### 6.3 Review Application Details
Admin sees:
- Complete applicant information
- Organization type and credibility
- Intended use case
- Asset details
- Community information
- Risk tier assessment

#### 6.4 Set License Fee

**Fee Structure (Example):**

**BIO Heritage:**
```
RESEARCH USE:
├── Academic/University: ₹10,000 - ₹25,000/year
├── Government Research: ₹15,000 - ₹40,000/year
└── Private Research: ₹50,000 - ₹1,00,000/year

COMMERCIAL USE:
├── Small Enterprise: ₹2,00,000 - ₹5,00,000/year
├── Medium Company: ₹5,00,000 - ₹15,00,000/year
└── Large Corporation: ₹15,00,000 - ₹50,00,000/year
    + Revenue Sharing: 2-5% of product sales
```

**SONIC Heritage:**
```
MEDIA USE:
├── Documentary/Educational: ₹25,000 - ₹1,00,000
├── Commercial Film/TV: ₹2,00,000 - ₹10,00,000
└── Advertisement: ₹5,00,000 - ₹25,00,000

MUSIC LICENSE:
├── Streaming (1 Year): ₹1,00,000 - ₹5,00,000
├── Album/Compilation: ₹3,00,000 - ₹15,00,000
└── Sampling Rights: ₹5,00,000 - ₹20,00,000
    + Royalty: 10-15% of revenue
```

Admin sets fee based on:
- Organization size
- Intended use
- Duration
- Commercial potential
- Risk tier

#### 6.5 Approval Decision

**Option A: APPROVE**

Admin actions:
1. Set license fee
2. Add special conditions (if any)
3. Click "Approve"

System generates agreement automatically

**Option B: REJECT**

Admin provides reason:
- Insufficient information
- Inappropriate use case
- Conflict of interest
- Other concerns

#### 6.6 Agreement Generation

**For BIO Heritage - RESEARCH USE:**
```
═══════════════════════════════════════════════════════════
              DHAROHAR LICENSE AGREEMENT
          BIO-HERITAGE RESEARCH USE LICENSE
═══════════════════════════════════════════════════════════

LICENSE ID: LIC-2024-001
AGREEMENT DATE: [DD-MM-YYYY]

PARTIES:
1. LICENSOR: [Community Name] (represented by Dharohar)
2. LICENSEE: [Applicant Name/Organization]

ASSET DETAILS:
- Asset ID: BIO-2024-0123
- Title: Traditional Neem Medicinal Knowledge
- Community: Gond Tribe, Madhya Pradesh
- Type: Bio-Heritage Knowledge

LICENSE TERMS:

1. GRANT OF LICENSE
   The Licensor grants the Licensee a non-exclusive, 
   non-transferable license to use the Asset for 
   RESEARCH PURPOSES ONLY.

2. PERMITTED USE
   - Academic research and study
   - Training and educational programs
   - Non-commercial documentation
   - Citation in research publications

3. PROHIBITED USE
   - Commercial exploitation
   - Product development for sale
   - Patent applications
   - Transfer to third parties

4. ATTRIBUTION REQUIREMENTS
   All use must include:
   "Traditional knowledge of [Community Name], 
   licensed through Dharohar Heritage Platform"

5. DURATION
   This license is valid for 3 years from [Date]

6. LICENSE FEE
   One-time fee: ₹75,000 (Rupees Seventy-Five Thousand)
   Payment due within 30 days

7. BENEFIT SHARING
   10% of license fee transferred to [Community Name]
   community development fund

8. CONFIDENTIALITY
   Licensee shall maintain confidentiality of 
   sensitive cultural information

9. TERMINATION
   License may be terminated if terms are violated

10. GOVERNING LAW
    Biological Diversity Act, 2002
    Traditional Knowledge Digital Library (TKDL)
    Indian Copyright Act, 1957

11. METADATA ACCESS
    Upon payment, Licensee receives:
    - Complete transcript
    - Full audio recording
    - Detailed metadata
    - Community contact (if consented)
    - Legal documentation

ACCEPTANCE:
Licensee: _________________________ Date: _______
         [Digital Signature]

Dharohar Representative: ___________ Date: _______
                        [Digital Signature]

         [GOVERNMENT SEAL]
═══════════════════════════════════════════════════════════
```

**For BIO Heritage - COMMERCIAL USE:**
```
═══════════════════════════════════════════════════════════
              DHAROHAR LICENSE AGREEMENT
         BIO-HERITAGE COMMERCIAL USE LICENSE
═══════════════════════════════════════════════════════════

LICENSE ID: LIC-2024-003
AGREEMENT DATE: [DD-MM-YYYY]

PARTIES:
1. LICENSOR: [Community Name] (represented by Dharohar)
2. LICENSEE: [Pharmaceutical Company Name]

ASSET DETAILS:
- Asset ID: BIO-2024-0123
- Title: Traditional Neem Medicinal Knowledge
- Community: Gond Tribe, Madhya Pradesh

LICENSE TERMS:

1. GRANT OF LICENSE
   Commercial exploitation rights for product development

2. PERMITTED USE
   - Product formulation and development
   - Manufacturing and distribution
   - Marketing and sale

3. FINANCIAL TERMS
   - Upfront License Fee: ₹25,00,000 (Twenty-Five Lakh)
   - Royalty: 3% of net product revenue
   - Minimum Annual Royalty: ₹5,00,000

4. BENEFIT SHARING (As per Biological Diversity Act)
   - 40% to [Community Name]
   - 30% to State Biodiversity Board
   - 20% to National Biodiversity Authority
   - 10% to Dharohar Platform maintenance

5. MANDATORY ATTRIBUTION
   Product packaging must state:
   "Based on traditional knowledge of [Community Name]"

6. REPORTING REQUIREMENTS
   Quarterly sales reports with royalty payments

7. DURATION
   5 years, renewable upon mutual consent

8. EXCLUSIVITY
   Non-exclusive (Community retains rights to license 
   to other parties)

9. QUALITY CONTROL
   Community has right to review product formulation

10. PATENT RESTRICTIONS
    Licensee may file patents but must:
    - Acknowledge traditional knowledge source
    - Include community as benefit shareholder
    - Cannot claim exclusive traditional knowledge rights

11. TERMINATION CLAUSES
    Immediate termination if:
    - Royalty payments delayed beyond 60 days
    - Misrepresentation of knowledge source
    - Violation of ethical standards

12. FULL ACCESS GRANTED
    Licensee receives complete documentation:
    - Full transcript and audio
    - Detailed preparation methods
    - Cultural context
    - Safety information
    - All metadata

GOVERNING LAW:
- Biological Diversity Act, 2002 (Section 6, 7, 19)
- Nagoya Protocol on Access and Benefit Sharing
- Indian Patent Act, 1970 (Section 3)
- Traditional Knowledge Digital Library (TKDL)

═══════════════════════════════════════════════════════════
```

**For SONIC Heritage:**
```
═══════════════════════════════════════════════════════════
              DHAROHAR LICENSE AGREEMENT
              SONIC HERITAGE MEDIA LICENSE
═══════════════════════════════════════════════════════════

LICENSE ID: LIC-2024-002
AGREEMENT DATE: [DD-MM-YYYY]

PARTIES:
1. LICENSOR: [Community Name] (represented by Dharohar)
2. LICENSEE: [Media House/Label Name]

ASSET DETAILS:
- Asset ID: SONIC-2024-0045
- Title: Harvest Celebration Song
- Community: Santhal Tribe, Jharkhand
- Duration: 3:24 minutes
- Language: Santhali

LICENSE TERMS:

1. GRANT OF LICENSE
   Non-exclusive license for media synchronization

2. PERMITTED USE
   - Film/TV/Documentary background score
   - Streaming on digital platforms
   - Public theatrical exhibition
   - Festival screenings

3. PROHIBITED USE
   - Sampling without explicit permission
   - Alteration of lyrics or melody
   - Use in political campaigns
   - Use in adult content

4. LICENSE FEE
   One-time payment: ₹5,00,000 (Five Lakh Rupees)

5. ROYALTIES (if commercially distributed)
   - Streaming: ₹0.50 per 1000 plays
   - Soundtrack sales: 12% of revenue
   - Public performance: As per IPRS rates

6. TERRITORY
   - Worldwide distribution rights

7. ATTRIBUTION REQUIREMENTS
   End credits must display:
   "Traditional Music: [Community Name]
    Courtesy: Dharohar Heritage Platform"

8. DURATION
   1 year from [Date], renewable

9. BENEFIT SHARING
   50% of license fee to [Community Name]
   50% to platform and preservation fund

10. MORAL RIGHTS
    Community retains right to:
    - Approve final usage
    - Request removal if misrepresented
    - Veto disrespectful contexts

11. CONTENT DELIVERY
    Licensee receives:
    - High-quality audio file (WAV/FLAC)
    - Complete metadata
    - Cultural usage guidelines
    - Credits and attribution text
    - Community contact (if consented)

GOVERNING LAW:
- Copyright Act, 1957 (Section 13, 14)
- Performers' Rights (Section 38, 38A)
- IPRS and PPL regulations

═══════════════════════════════════════════════════════════
```

#### 6.7 Post-Approval Actions

**System automatically:**
1. Updates license status to `APPROVED`
2. Sends agreement to applicant via email
3. Notifies community of new license
4. Grants full metadata access to licensee
5. Sets up payment tracking
6. Updates community dashboard

**Applicant Dashboard Update:**
```
LICENSE APPROVED ✅

Application #LIC-2024-001
Status: APPROVED
Asset: Traditional Neem Remedies
Fee: ₹75,000

[📄 Download Agreement]
[💳 Make Payment]
[📊 Access Full Metadata]
```

**Community Dashboard Update:**
```
NEW LICENSE ISSUED

Your asset "Traditional Neem Remedies" 
has been licensed to:

Organization: ABC Pharma Ltd.
Type: RESEARCH USE
Duration: 3 Years
Fee: ₹75,000
Your Share: ₹7,500 (10%)

[View Agreement Details]
[Track Usage]
```

#### 6.8 Full Metadata Access (After Payment)

Once licensee pays, they receive complete access:

**For BIO Heritage:**
- ✅ Full audio recording (downloadable)
- ✅ Complete transcript (all languages)
- ✅ Detailed preparation/application methods
- ✅ Cultural context and significance
- ✅ Safety warnings and precautions
- ✅ Recordee information (if consented)
- ✅ GPS coordinates
- ✅ All metadata fields
- ✅ Legal documentation

**For SONIC Heritage:**
- ✅ High-quality audio file (lossless)
- ✅ Stems/tracks (if available)
- ✅ Lyrics (original + translated)
- ✅ Musical notation
- ✅ Cultural performance context
- ✅ Instrument details
- ✅ Performer credits
- ✅ Audio fingerprint data
- ✅ All metadata fields

---

## COMPLETE SYSTEM FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    DHAROHAR SYSTEM WORKFLOW                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

        ┌──────────────────┐
        │  1. COMMUNITY    │
        │     (Client)     │
        └────────┬─────────┘
                 │
                 ├─→ Upload BIO Heritage (Voice)
                 │   ├─ Auto Transcribe
                 │   ├─ Capture Geo Data
                 │   ├─ Generate Documentation
                 │   └─ Status: PENDING
                 │
                 └─→ Upload SONIC Heritage (Music)
                     ├─ Generate Fingerprint
                     ├─ Capture Metadata
                     ├─ Generate Documentation
                     └─ Status: PENDING
                 │
                 ▼
        ┌──────────────────┐
        │  2. REVIEW BOARD │
        │   (Gov Body)     │
        └────────┬─────────┘
                 │
                 ├─→ View Submissions
                 │   ├─ Listen/Read Content
                 │   ├─ Verify Authenticity
                 │   └─ Assess Risk Tier
                 │
                 ├─→ APPROVE
                 │   ├─ Generate License Seal
                 │   ├─ Status: APPROVED
                 │   └─ Visible in Public Explorer
                 │
                 └─→ REJECT
                     ├─ Add Feedback
                     ├─ Status: REJECTED
                     └─ Notify Community
                 │
                 ▼
        ┌──────────────────┐
        │  3. PUBLIC       │
        │   (General)      │
        └────────┬─────────┘
                 │
                 ├─→ Browse Public Explorer
                 │   ├─ View Community Info
                 │   ├─ See Cultural Summary
                 │   ├─ Preview Audio (30 sec)
                 │   └─ Check License Status
                 │
                 └─→ Apply for License
                     │
                     ├─→ BIO Heritage
                     │   ├─ RESEARCH USE
                     │   │  (Universities, Training)
                     │   └─ COMMERCIAL USE
                     │      (Pharma, Product Dev)
                     │
                     └─→ SONIC Heritage
                         └─ MEDIA/COMMERCIAL USE
                            (Films, Labels, Media)
                 │
                 ▼
        ┌──────────────────┐
        │  4. ADMIN        │
        │   (Licensing)    │
        └────────┬─────────┘
                 │
                 ├─→ Review License Application
                 │   ├─ Assess Organization
                 │   ├─ Verify Use Case
                 │   └─ Check Asset Risk Tier
                 │
                 ├─→ Set Fees
                 │   ├─ Research: ₹10K - ₹1L
                 │   ├─ Commercial: ₹2L - ₹50L
                 │   └─ Media: ₹25K - ₹25L
                 │
                 ├─→ APPROVE
                 │   ├─ Generate Agreement
                 │   ├─ Set Payment Terms
                 │   ├─ Grant Full Access
                 │   └─ Notify All Parties
                 │
                 └─→ REJECT
                     └─ Provide Reason
                 │
                 ▼
        ┌──────────────────┐
        │  OUTCOMES        │
        └──────────────────┘
                 │
                 ├─→ Licensee Access
                 │   ├─ Download Agreement
                 │   ├─ Make Payment
                 │   ├─ Access Full Metadata
                 │   └─ Use for Intended Purpose
                 │
                 └─→ Community Dashboard
                     ├─ View Active Licenses
                     ├─ Track Revenue Share
                     ├─ See Usage Reports
                     └─ Monitor Agreement Terms
```

---

## DATA FLOW & STORAGE

### Database Operations

#### Community Uploads
```javascript
// BIO Heritage Submission
{
  _id: ObjectId,
  type: "BIO",
  title: "Traditional Neem Remedies",
  description: "Medicinal uses of neem...",
  communityName: "Gond Tribe",
  recordeeName: "Elder Name",
  transcript: "Full transcribed text...",
  audioFile: "/uploads/bio/audio_123.wav",
  metadata: {
    geoLocation: { lat: 22.xxx, lng: 78.xxx },
    recordedDate: "2024-03-01",
    language: "Gondi",
    category: "Medicinal",
    duration: "12:34"
  },
  fingerprint: "hash_abc123",
  riskTier: "MODERATE",
  suggestedLicenseType: ["RESEARCH", "COMMERCIAL"],
  approvalStatus: "PENDING",
  reviewComment: null,
  createdBy: ObjectId(userId),
  createdAt: Date
}
```

#### License Application
```javascript
{
  _id: ObjectId,
  assetId: ObjectId(assetId),
  applicantId: ObjectId(userId),
  licenseType: "COMMERCIAL",
  purpose: "Product development for herbal medicine",
  organizationType: "Pharmaceutical",
  duration: 36, // months
  fee: 2500000, // ₹25 Lakhs
  status: "APPROVED",
  agreementText: "Full legal text...",
  paymentStatus: "PAID",
  paymentDate: Date,
  benefitSharing: {
    community: 1000000,
    stateboard: 750000,
    nationalauth: 500000,
    platform: 250000
  },
  createdAt: Date,
  approvedAt: Date
}
```

---

## KEY DIFFERENTIATION: RESEARCH vs COMMERCIAL

### BIO Heritage Licensing

| Aspect | RESEARCH USE | COMMERCIAL USE |
|--------|--------------|----------------|
| **Purpose** | Academic study, training, education | Product development, sales, profit |
| **Users** | Universities, research institutes | Pharma companies, businesses |
| **Fee Range** | ₹10K - ₹1L | ₹2L - ₹50L+ |
| **Royalty** | None | 2-5% of product revenue |
| **Attribution** | Academic citation | Product packaging label |
| **Restrictions** | No commercial use | Benefit sharing mandatory |
| **Duration** | 1-3 years | 3-5 years |
| **Patent Rights** | Cannot patent | Limited, with community share |

### SONIC Heritage Licensing

| Aspect | MEDIA USE | COMMERCIAL MUSIC |
|--------|-----------|------------------|
| **Purpose** | Film/TV/documentary | Distribution, streaming, albums |
| **Users** | Media houses, filmmakers | Music labels, platforms |
| **Fee Range** | ₹25K - ₹10L | ₹1L - ₹20L |
| **Royalty** | Per-play or % | 10-15% of revenue |
| **Attribution** | End credits | Album credits |
| **Modifications** | Limited | Sampling requires approval |

---

## NOTIFICATION SYSTEM

### Community Notifications
- ✉️ "Submission received - Under review"
- ✉️ "Submission APPROVED by Review Board"
- ✉️ "Submission REJECTED - See feedback"
- ✉️ "New license application received for your asset"
- ✉️ "License APPROVED - Payment pending"
- ✉️ "Payment received - License active"
- ✉️ "Revenue share deposited: ₹X"

### Review Board Notifications
- ✉️ "New submission pending review: [Asset ID]"
- ✉️ "High-risk content flagged for review"

### Admin Notifications
- ✉️ "New license application: [Application ID]"
- ✉️ "Payment received for License [LIC-XXX]"
- ✉️ "License expiring in 30 days: [LIC-XXX]"

### General User Notifications
- ✉️ "License application submitted"
- ✉️ "License APPROVED - Agreement ready"
- ✉️ "License REJECTED - See reason"
- ✉️ "Payment reminder: Due in X days"
- ✉️ "Full metadata access granted"

---

## LEGAL FRAMEWORK COMPLIANCE

### Indian Laws Referenced

1. **Biological Diversity Act, 2002**
   - Section 6: Regulation of access to biological resources
   - Section 7: Approval by National Biodiversity Authority
   - Section 19: Benefit sharing
   - Section 21: Benefit claimers

2. **Traditional Knowledge Digital Library (TKDL)**
   - Prevention of biopiracy
   - Documentation of traditional knowledge
   - Patent opposition

3. **Copyright Act, 1957**
   - Section 13: Works in which copyright subsists
   - Section 14: Meaning of copyright
   - Section 38: Performers' rights
   - Section 38A: Broadcasters' rights

4. **Nagoya Protocol**
   - Access and Benefit Sharing (ABS)
   - Prior Informed Consent (PIC)
   - Mutually Agreed Terms (MAT)

5. **Indian Patent Act, 1970**
   - Section 3: What are not inventions
   - Section 25: Opposition to patent (prior art)

---

## SUCCESS CRITERIA

The system is successful when:

✅ Community can easily upload and track their heritage
✅ Review process is transparent and documented
✅ Public can discover heritage without exploitation
✅ Licensing is fair, legal, and trackable
✅ Revenue flows back to communities
✅ Traditional knowledge is protected from biopiracy
✅ Legal agreements are auto-generated correctly
✅ All stakeholders have appropriate access levels

---

## PROTOTYPE DEMO SCRIPT

### Complete End-to-End Flow (15 minutes)

**Minute 1-3: Community Upload**
1. Login as Gond Tribe community
2. Upload BIO: "Neem Medicinal Knowledge" (voice recording)
3. System transcribes and generates documentation
4. Show PENDING status

**Minute 4-6: Review Board**
1. Login as Review Board
2. See pending submission
3. Review transcript and audio
4. Approve with MODERATE risk tier
5. Show generated approval seal

**Minute 7-9: Public Explorer**
1. Browse as guest (no login)
2. See approved asset in 3D tree explorer
3. View limited info (community, summary, category)
4. Note: Full transcript NOT visible
5. Click "Apply for License"

**Minute 10-12: License Application**
1. Register/Login as General User (ABC Pharma)
2. Select COMMERCIAL USE license
3. Fill application form
4. Submit (status: PENDING)

**Minute 13-15: Admin Approval**
1. Login as Admin
2. Review license request
3. Set fee: ₹25,00,000
4. Approve
5. Show auto-generated agreement
6. Community dashboard updates with license info
7. Applicant receives full metadata access

**DEMO COMPLETE** ✅

---

## CONCLUSION

This workflow ensures:

- **Protection** of tribal intellectual property
- **Transparency** in review and licensing
- **Fair compensation** for communities
- **Legal compliance** with Indian heritage laws
- **Controlled access** to sensitive knowledge
- **Benefit sharing** as per Biological Diversity Act

The system is NOT a marketplace—it is a **governance infrastructure** for cultural heritage management.

---

**Document Version**: 1.0  
**Last Updated**: March 2024  
**Status**: Prototype Specification

---
