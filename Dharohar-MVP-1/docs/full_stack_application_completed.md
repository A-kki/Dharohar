# DHAROHAR Platform — Full Stack Application Completed
**Current State & Future Roadmap**

## 1. Project Overview & Accomplishments So Far
The foundational DHAROHAR application has been successfully built and deployed as a robust, full-stack, role-based platform designed to protect and govern indigenous cultural and biological knowledge.

### **Core Systems Implemented:**
- **Role-Based Access Control (RBAC):** Distinct workflows for `community` (knowledge holders), `review` (domain experts), `admin` (legal/governance), and `general` (researchers/commercial entities). Strict API guards and frontend route dispatchers prevent unauthorized access.
- **Asset Archival System:** Secure upload wizard supporting both Biological Knowledge (`BIO`) and Sonic Heritage (`SONIC`). Media is securely stored using MongoDB GridFS with optimized HTTP Range request support for seamless video/audio streaming.
- **Institutional Design System:** A custom, premium UI/UX featuring parchment themes, subtle animations, framed sections, and a distinctive rotating ceremonial splash loader. Fully responsive for mobile and desktop.
- **Licensing Engine & Marketplace:** A public-facing marketplace where approved assets can be discovered. General users can apply for specific licenses (Research, Commercial, Media) through a structured wizard. Admins can review, approve, reject, or request modifications to these applications.
- **AI Integration (Phase 1):** Google Gemini AI is integrated into the backend to automatically process incoming assets, extracting keywords, generating summaries, and assessing initial cultural sensitivity.

---

## 2. Next Phase Roadmap: Advanced Intelligence & Immutability

The foundation is ready to be scaled into a highly intelligent, legally verifiable ecosystem. The following features outline the next steps for system evolution.

### **Part 1 — Advanced AI Workflows**

#### **1. AI for Risk Tier Detection**
Automatically flag submissions based on deep cultural context.
- **Detection Targets:** Medicinal formulations, sacred rituals, restricted ecological knowledge.
- **Action:** If the model detects high-risk signals, the asset is auto-flagged for special review and prevented from entering the public preview marketplace until explicitly cleared by the review board.
- *Outcome: AI enforces compliance and cultural safety.*

#### **2. AI for License Abuse Detection**
When a general user applies for a license, the AI evaluates their proposed usage.
- **Analysis:** The AI checks the user's "Intended Use Description".
- **Detection Targets:** Is the purpose vague? Does it sound like commercial misuse disguised as research? Are they copying/pasting past fraudulent applications?
- **Action:** If risky behavior is detected, the application is flagged directly to the Admin board with an AI risk-assessment note.

#### **3. AI for Sonic & Media Analysis**
Enhancing discoverability for DHAROHAR-Sonic assets.
- **Features:** Auto-generate short descriptions based on audio content, detect the spoken/sung language, extract key cultural themes, and transcribe lyrics or oral histories automatically.
- *Outcome: Vastly improves searchability and cataloging speed.*

#### **4. AI-Generated Legislative Documentation**
Based on the community user's asset input (audio or text), the AI will:
- Transcribe the raw community input.
- Analyze the cultural/biological context.
- **Auto-draft a formal legislative document** detailing specific usage rights, limitations, and royalty structures.
- This drafted document is provided directly to the Review Board to issue a highly customized, air-tight license efficiently.

---

### **Part 2 — Blockchain Governance Integrity**

Blockchain will be used strictly for **immutable provenance, tamper-proof approvals, and license authenticity** — prioritizing legal trust over hype.

*Core Rule: Full data stays in MongoDB. Only cryptographic hashes are stored on the blockchain.*

#### **1. Asset Approval Recording**
When a reviewer approves an asset, a blockchain transaction is created containing:
- `assetId`
- `communityId`
- `timestamp`
- `approvalHash` (SHA-256 of the asset metadata)
- *Benefit: Even if the centralized MongoDB database is maliciously altered, the blockchain hash will no longer match, instantly flagging tampering.*

#### **2. License Issuance Record**
When an admin approves a license, a blockchain entry is minted:
- `licenseId`
- `assetId`
- `licenseeId`
- `timestamp`
- `documentHash` (Hash of the generated legislative contract)
- *Benefit: The issued license becomes legally verifiable by external third parties (e.g., courts, media platforms, research institutions).*

#### **3. NFT-Style Certificates (Optional Advanced)**
Generate a final License Certificate PDF.
- Compute the SHA-256 hash of the PDF.
- Store the hash on the blockchain.
- Provide a public verification endpoint on the DHAROHAR platform where anyone can upload a PDF license to verify its authenticity against the blockchain ledger.

---

## 3. Recommended Blockchain Architecture

For the ongoing development, prototype, and hackathon phases:

- **Option A (Recommended for Agile Prototypes):** **Polygon Testnet**. Low cost, EVM compatible, establish a simple Smart Contract to store hashes.
- **Option B (Enterprise Governance):** **Hyperledger Fabric**. A private, permissioned chain best suited for institutional and government-level data integrity.
- **Option C (Standard):** **Ethereum Sepolia Testnet**. Simple hash storage.

### **Final Unified Architecture Diagram**

```text
       [ Frontend UI / User Workflows ]
                     ↓
        [ Node.js / Express Backend ]
                     ↓
      [ MongoDB (Structured Metadata) ]
                     ↓
[ AI Layer (Gemini / Bedrock / OpenAI APIs) ]
            (Intelligence Base)
                     ↓
 [ Blockchain Layer (Polygon / Hyperledger) ]
            (Immutability Base)
```

**Philosophy:** *AI provides the intelligence and scaling. Blockchain provides the legal immutability and trust.*
