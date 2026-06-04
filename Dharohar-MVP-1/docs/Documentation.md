# DHAROHAR - Comprehensive Project Documentation (MVP)

---

### 📖 Platform Guides
*   **[Quick Start Setup](./QUICKSTART.md)** — Step-by-step local installation.
*   **[System Architecture](./ARCHITECTURE.md)** — Tech stack, data flow, and RBAC design.
*   **[File Structure](./FILE_STRUCTURE.md)** — Annotated directory tree and module map.

---

## 1. Project Overview
DHAROHAR is an institutional governance platform designed to manage, protect, and license indigenous cultural knowledge and media. The platform focuses on high-fidelity archival practices, structured licensing frameworks, and educational exploration, bridging the gap between traditional communities, researchers, and commercial entities while ensuring ethical attribution and compensation.

## 2. Architecture & Tech Stack
*   **Frontend**: React 18, TypeScript, Vite.
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Atlas) interacted with via Mongoose ORM.
*   **Authentication**: JSON Web Tokens (JWT) mapped to role-based access control (RBAC). Passwords hashed via `bcryptjs`.
*   **Routing & Access**: React Router DOM with a strict `ProtectedRoute` wrapper utilizing an `AuthContext` to manage the session state. Role-specific dashboard routing via `DashboardRouter`.
*   **Design & UI**: Custom vanilla CSS modules, an earth-tone palette inspired by Indian heritage (Parchment, Burnt Umber, Terracotta, Muted Gold), and an institutional global loader (rotating ceremonial symbol with parchment glassmorphic overlay).
*   **Service Layer**: Axios encapsulates API calls injected with JWT bearer tokens.

## 3. Implemented Features & Workflows

### 3.1 Role-Based Access Control (RBAC)
The system is rigidly separated into four operational roles, enforced dynamically on the frontend and strictly on the backend (`roleGuard` middleware):
*   **Community (`community`)**: Knowledge submitter interface.
*   **Reviewer (`review`)**: Institutional review board to verify incoming submissions.
*   **Admin (`admin`)**: Platform governance, final sign-offs on license requests.
*   **General (`general`)**: Researchers, media companies, or individuals applying for licenses.

### 3.2 Asset Archival Flow (Community & Reviewer)
1.  **Submission**: Local community members submit high-fidelity archival dossiers (Oral Histories, Bio-knowledge, or Ritual Videos).
2.  **Asset Schema**: Records `type` (`BIO` or `SONIC`), `title`, `description`, `communityName`, `recordeeName`, `riskTier`, and `mediaUrl`.
3.  **Review Queue**: Submissions land in the Reviewer Dashboard (`PENDING`).
4.  **Verification**: 
    *   Reviewers can play the attached audio/video via an in-app media player.
    *   Reviewers can `Approve` (moves to the public knowledge archive) or `Reject` (requires a mandatory feedback comment).
5.  **History Panel**: Both Community and Reviewers have historical views (`My Submissions`, `Review History`) displaying past approvals/rejections.

### 3.3 Public Discovery & Marketplace
*   **Cultural Explorer**: A public, unauthenticated landing page featuring a 3D WebGL Tree visualization and displaying approved (`DHAROHAR-BIO` and `DHAROHAR-SONIC`) assets.
*   **Marketplace**: A searchable grid of approved archival records.
*   **Media Teasers**: General users can preview/listen to `mediaUrl` snippets directly on the asset cards. 
*   **Secure Navigation**: Clicking "Apply" redirects logged-in users to the application form and prompts unauthenticated users to sign in.

### 3.4 Licensing & Governance Flow (General User & Admin)
1.  **Application Engine**: An application wizard (`/apply/:assetId`) dynamically rendering forms based on the asset type and intent:
    *   *Research (BIO)*: Lead researcher, institution, IRB approval, etc.
    *   *Commercial (BIO)*: Company name, revenue expectations, proposed royalty rate.
    *   *Media (SONIC)*: Project title, platform distribution, crediting plan.
2.  **Admin Review**: Admin reviews arriving applications in the `License Requests` dashboard.
3.  **Media Access Verification**: Admin can play the requested asset's media directly on the request card to verify context before approving.
4.  **Admin Decisions**:
    *   *Approve*: Automatically generates a legally binding "Agreement Text" stipulating royalties, attribution rules, and data limits. Grants the user access.
    *   *Reject*: Mandatory justification provided.
    *   *Request Modification*: Sends the application back to the General User for revisions.
5.  **User Portal (`MyLicenses`)**:
    *   Users see the status of their application.
    *   If `MODIFICATION_REQUIRED`, an edit pane opens to update the purpose/documentation.
    *   **Secure Vault (Media Access)**: The media file underlying the asset remains "Locked (🔒)" during review. Upon `APPROVED`, the user is granted a "Fully Unlocked (🔓)" media player containing the full audio/video track alongside the issued Agreement contract.
6.  **History View**: Admin has a dedicated `License History` tab to search and filter all processed applications.

### 3.5 Operational UX Polish
*   **Global Loader (`<Loader />`)**: A unified, institutional screen overlay utilizing a rotating historic seal with a 10-second linear spin, deployed during high-latency operations (authentication checks, asset submissions, license decisions).
*   **Action-level Status**: Preventative double-click handlers and localized loading states (`isActioning`) during critical DB writes.
*   **Global API Catching**: The Axios interceptor automatically listens for `401 Unauthorized` errors, purging stale tokens from LocalStorage and forcing a redirect to `/login`.

## 4. Pending & Future Scopes
*   **Direct Cloud Object Storage integration**: Migrating `mediaUrl` from external static links to direct multipart server uploads (via Multer → AWS S3 / Cloudinary).
*   **Stripe/Payment Integration**: Escrowing and disbursing commercial royalties directly to community bank accounts upon Admin verification.
*   **Full 3D WebGL implementation**: Wiring the interactive `react-three-fiber` landing page model with live asset counts and interactive nodes.
