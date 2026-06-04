# 👥 Role-Based Workflow

DHAROHAR enforces a **four-role access model** where every user belongs to exactly one role, and each role has a distinct, non-overlapping workflow. No user can cross role boundaries; the system is governed by backend middleware that enforces this at the API layer.

---

## 1. Role Hierarchy

| Role | Value (DB Enum) | Primary Actor | Governed By |
|:-----|:----------------|:--------------|:------------|
| **Community** | `community` | Indigenous knowledge holders | `roleGuard(['community'])` |
| **Reviewer** | `review` | Institutional archivists | `roleGuard(['review'])` |
| **Admin** | `admin` | Platform governors | `roleGuard(['admin'])` |
| **General** | `general` | Researchers / Businesses / Media | `roleGuard(['general'])` |

> These roles are defined as a Mongoose enum in `User.js` and validated on registration:
> ```js
> role: { type: String, enum: ['community', 'review', 'admin', 'general'], required: true }
> ```

---

## 2. Workflow Per Role

### 🌿 Community Role → Asset Submission Workflow

```
[Community User]
     │
     ▼
Upload Asset (UploadAsset.tsx)
  ├── Type: BIO (Biological Knowledge) or SONIC (Media/Song)
  ├── Fill: title, description, communityName, recordeeName
  ├── GPS metadata, transcript, riskTier (LOW / MEDIUM / HIGH)
  └── Upload media file (GridFS / Cloudinary)
     │
     ▼
Asset saved → status: PENDING (awaits review)
     │
     ▼
My Submissions (MySubmissions.tsx)
  ├── Track status: PENDING / APPROVED / REJECTED
  ├── View full dossier (hidden geoloc, oral history, media player)
  └── If REJECTED → view mandatory reviewComment
```

**Visible Routes:** `/upload`, `/my-submissions`
**Blocked Routes:** `/marketplace`, `/licenses`, `/review-queue`

---

### 🔎 Reviewer Role → Archival Review Workflow

```
[Reviewer]
     │
     ▼
Review Queue (ReviewDashboard.tsx)
  ├── Lists all PENDING assets
  ├── Embedded audio/video player for media verification
  ├── APPROVE → asset.approvalStatus = 'APPROVED' (enters Marketplace)
  └── REJECT  → requires mandatory reviewComment
     │
     ▼
Review History (ReviewHistory.tsx)
  └── Searchable log of all APPROVED/REJECTED decisions
```

**API Guard:** `GET /assets/pending` → `roleGuard(['review'])`
**API Guard:** `PATCH /assets/:id/approve` → `roleGuard(['review'])`
**API Guard:** `PATCH /assets/:id/reject` → `roleGuard(['review'])`

---

### ⚖️ Admin Role → License Governance Workflow

```
[Admin]
     │
     ▼
License Requests Dashboard
  ├── Lists all PENDING license applications
  ├── View applicant details, asset info, purpose, documentation
  ├── APPROVE → generates agreementText contract
  ├── REJECT  → requires mandatory adminComment
  └── MODIFICATION_REQUIRED → sends back with feedback
     │
     ▼
License History (LicenseHistory.tsx)
  └── Full audit of all decisions with agreement texts
```

**API Guard:** `GET /licenses/pending` → `roleGuard(['admin'])`
**API Guard:** `PATCH /licenses/:id/approve` → `roleGuard(['admin'])`

---

### 🔓 General Role → License Application Workflow

```
[General User]
     │
     ▼
Marketplace (Marketplace.tsx)
  └── Browse all APPROVED assets
     │
     ▼
Apply For License (ApplyForLicense.tsx)
  ├── RESEARCH: institution, IRB ethics, researcher, duration
  ├── COMMERCIAL: company registration, royalty rate, community benefit plan
  └── MEDIA: distribution platform, estimated audience, project title
     │
     ▼
My Licenses (MyLicenses.tsx)
  ├── PENDING → media locked (🔒)
  ├── MODIFICATION_REQUIRED → Edit & Resubmit form revealed
  ├── REJECTED → adminComment shown
  └── APPROVED → media unlocked (🔓), Agreement Contract displayed
```

---

## 3. Frontend Route Guards

The frontend mirrors backend roles using `ProtectedRoute` components that check `AuthContext`:

| Route | Allowed Role |
|:------|:-------------|
| `/upload` | `community` |
| `/my-submissions` | `community` |
| `/review-queue` | `review` |
| `/review-history` | `review` |
| `/license-requests` | `admin` |
| `/license-history` | `admin` |
| `/marketplace` | `general` |
| `/my-licenses` | `general` |

---

## 4. Middleware Chain

Every protected API call passes through a two-layer middleware chain:

```
HTTP Request
    │
    ▼
protect() — auth.js
  ├── Validates Bearer token (JWT)
  ├── Verifies signature against JWT_SECRET
  └── Attaches decoded payload → req.user
    │
    ▼
roleGuard(['role1', 'role2']) — roleGuard.js
  ├── Reads req.user.role
  ├── Checks if role is in allowedRoles[]
  └── 403 if unauthorized; next() if permitted
    │
    ▼
Controller Function
```
