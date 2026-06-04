# ✅ Data Validation

DHAROHAR applies a multi-layer validation strategy. The **Mongoose schema layer** is the authoritative source of validation rules and enforces data integrity before anything is persisted to MongoDB. The frontend provides UX-level feedback, but the backend is the system-of-record.

---

## 1. User Model Validation (`User.js`)

| Field | Rule | Error Message |
|:------|:-----|:--------------|
| `name` | Required, max 50 chars | `'Name is required'`, `'Name cannot exceed 50 characters'` |
| `email` | Required, unique, lowercase, regex | `'Email is required'`, `'Please provide a valid email'` |
| `passwordHash` | Required, `select: false` (never returned in queries) | `'Password hash is required'` |
| `role` | Required, enum: `['community', 'review', 'admin', 'general']` | `'{VALUE} is not a valid role'` |

> **Security note:** `passwordHash` has `select: false`, meaning it's automatically excluded from all queries unless explicitly requested. Password hashing via BCrypt is performed in `authService.js` before the hash reaches the model.

---

## 2. Asset Model Validation (`Asset.js`)

| Field | Rule | Error Message |
|:------|:-----|:--------------|
| `type` | Required, enum: `['BIO', 'SONIC']` | `'{VALUE} is not a valid asset type'` |
| `title` | Required, trimmed, max 200 chars | `'Title is required'`, `'Title cannot exceed 200 characters'` |
| `description` | Required, max 2000 chars | `'Description is required'`, `'Description cannot exceed 2000 characters'` |
| `communityName` | Required | `'Community name is required'` |
| `recordeeName` | Required | `'Recordee name is required'` |
| `riskTier` | Enum: `['LOW', 'MEDIUM', 'HIGH']`, default `'LOW'` | — |
| `approvalStatus` | Enum: `['PENDING', 'APPROVED', 'REJECTED']`, default `'PENDING'` | — |
| `reviewComment` | Optional, max 500 chars | `'Comment cannot exceed 500 characters'` |
| `createdBy` | Required, ObjectId ref to User | — |

### Indexes
```js
AssetSchema.index({ title: 'text', description: 'text', communityName: 'text' });
// Enables full-text search across the Marketplace
```

---

## 3. License Model Validation (`License.js`)

The License model has conditional fields depending on the `licenseType`. Core fields are always required; type-specific fields are optional at the schema level but validated by service-layer logic.

### Core Fields (All License Types)

| Field | Rule |
|:------|:-----|
| `assetId` | Required, indexed ObjectId ref to Asset |
| `applicantId` | Required, indexed ObjectId ref to User |
| `licenseType` | Required, enum: `['RESEARCH', 'COMMERCIAL', 'MEDIA']` |
| `purpose` | Required, max 1000 chars |
| `status` | Enum: `['PENDING','APPROVED','REJECTED','MODIFICATION_REQUIRED']`, default `'PENDING'` |
| `adminComment` | Optional, max 500 chars |
| `fee` | Optional, min: `0` |

### Type-Specific Fields

**RESEARCH License:**
| Field | Notes |
|:------|:------|
| `institutionName` | Name of applying institution |
| `researchTitle` | Study/project title |
| `researchObjective` | Max 2000 chars |
| `leadResearcher` | Primary investigator |
| `irb_ethics_approval` | Ethics board reference |
| `expectedDuration` | Timeline string |
| `publicationPlan` | Dissemination intent |

**COMMERCIAL License:**
| Field | Notes |
|:------|:------|
| `companyName` | Legal company name |
| `companyRegistration` | Registration number |
| `commercialUseDescription` | Max 2000 chars |
| `productName` | Target product |
| `expectedRevenue` | Revenue projection |
| `communityBenefitPlan` | How community benefits (80% revenue to end user per policy) |
| `proposedRoyaltyRate` | Royalty rate string |

**MEDIA License:**
| Field | Notes |
|:------|:------|
| `projectTitle` | Media project name |
| `mediaType` | e.g. Film, Documentary, Podcast |
| `distributionPlatform` | e.g. Netflix, YouTube |
| `estimatedAudience` | Reach estimate |
| `creditingPlan` | Attribution plan for the community |

### Compound Index
```js
LicenseSchema.index({ applicantId: 1, assetId: 1 });
// Prevents duplicate applications; ensures efficient lookups
```

---

## 4. Service-Layer Validation

Beyond schema validation, `licenseService.js` enforces **business rule validation** before database writes:

### Rule: Only Apply on Approved Assets
```js
if (asset.approvalStatus !== 'APPROVED') {
    throw new Error('Can only apply for licenses on approved assets'); // HTTP 403
}
```

### Rule: Comment Required for Rejection/Modification
```js
// rejectLicense()
if (!adminComment || adminComment.trim() === '') {
    throw new Error('Rejection requires an admin comment'); // HTTP 400
}

// requestModification()
if (!adminComment || adminComment.trim() === '') {
    throw new Error('Modification request requires a comment'); // HTTP 400
}
```

### Rule: Ownership Check on Resubmission
```js
if (license.applicantId.toString() !== userId.toString()) {
    throw new Error('Unauthorized'); // HTTP 403
}
```

---

## 5. Error Response Format

All validation failures are handled by `errorHandler.js` middleware, which normalizes Mongoose `ValidationError` objects and custom errors into a consistent JSON response:

```json
{
  "error": "Descriptive error message",
  "statusCode": 400
}
```

This ensures the frontend always receives a predictable error shape for display.
