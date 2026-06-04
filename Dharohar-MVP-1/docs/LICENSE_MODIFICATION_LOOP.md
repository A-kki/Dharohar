# 🔄 License Modification Loop

The License Modification Loop is a **three-actor, asynchronous feedback cycle** that allows admins to request clarifications or revisions from a license applicant without outright rejecting their application. It is the primary mechanism for institutional negotiation within DHAROHAR.

---

## 1. Why This Exists

A binary Approve/Reject system forces admins to reject applications that are merely incomplete or unclear — which wastes time for both the applicant and the institution. The Modification Loop enables a **dialogue** without losing the institutional audit trail.

---

## 2. The Full Loop — Step by Step

```
┌─────────────────────────────────────────────────────────────────────┐
│                      LICENSE MODIFICATION LOOP                      │
│                                                                     │
│  [General User]                                    [Admin]          │
│       │                                               │             │
│       │  1. Apply for License                         │             │
│       ├──────────────────────────────────────────────►│             │
│       │     status: PENDING                           │             │
│       │                                               │             │
│       │  2. Admin reviews, finds issues               │             │
│       │◄──────────────────────────────────────────────┤             │
│       │     status: MODIFICATION_REQUIRED             │             │
│       │     adminComment: "Please clarify XYZ"        │             │
│       │                                               │             │
│       │  3. User sees feedback in MyLicenses.tsx      │             │
│       │     → "Edit & Resubmit" form revealed         │             │
│       │                                               │             │
│       │  4. User updates purpose/documentation        │             │
│       │     and clicks "Resubmit"                     │             │
│       ├──────────────────────────────────────────────►│             │
│       │     status: PENDING (again)                   │             │
│       │     adminComment: null (cleared)              │             │
│       │                                               │             │
│       │  5. Admin reviews updated application         │             │
│       │     → APPROVE or REJECT or another loop       │             │
│       │◄──────────────────────────────────────────────┤             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Backend Implementation

### Step 2: Admin Requests Modification (`requestModification` in `licenseService.js`)

```js
const requestModification = async (licenseId, adminComment, adminId) => {
    // Guard: comment is mandatory
    if (!adminComment || adminComment.trim() === '') {
        throw new Error('Modification request requires a comment'); // 400
    }

    // Guard: only PENDING licenses can enter modification state
    if (license.status !== 'PENDING') {
        throw new Error(`Cannot request modification for license with status "${license.status}"`); // 409
    }

    license.status = 'MODIFICATION_REQUIRED';
    license.adminComment = adminComment;
    await license.save({ session });

    // Audit: action = 'LICENSE_MOD_REQ'
};
```

**API Route:** `PATCH /licenses/:id/modify` → `roleGuard(['admin'])`

---

### Step 4: User Resubmits (`resubmitLicense` in `licenseService.js`)

```js
const resubmitLicense = async (licenseId, updateData, userId) => {
    // Guard: only the original applicant can resubmit
    if (license.applicantId.toString() !== userId.toString()) {
        throw new Error('Unauthorized'); // 403
    }

    // Guard: only MODIFICATION_REQUIRED licenses can be resubmitted
    if (license.status !== 'MODIFICATION_REQUIRED') {
        throw new Error('Resubmission only allowed for licenses requiring modification'); // 409
    }

    // Editable fields
    if (updateData.purpose) license.purpose = updateData.purpose;
    if (updateData.documentation) license.documentation = updateData.documentation;
    if (updateData.documentationFileId) license.documentationFileId = updateData.documentationFileId;

    license.status = 'PENDING';
    license.adminComment = null; // Clear previous feedback
    await license.save({ session });

    // Audit: action = 'LICENSE_APPLY' (logged as a fresh application entry)
};
```

**API Route:** `PATCH /licenses/:id/resubmit` → `roleGuard(['general'])`

---

## 4. What the User Sees — Frontend (`MyLicenses.tsx`)

The frontend renders the "Edit & Resubmit" form **conditionally based on license status**:

```tsx
{license.status === 'MODIFICATION_REQUIRED' && (
  <div className="modification-panel">
    <p className="admin-feedback">
      Admin Feedback: "{license.adminComment}"
    </p>
    <textarea
      placeholder="Update your purpose statement..."
      value={newPurpose}
      onChange={(e) => setNewPurpose(e.target.value)}
    />
    <button onClick={() => handleResubmit(license._id)}>
      Edit & Resubmit
    </button>
  </div>
)}
```

When `status !== 'MODIFICATION_REQUIRED'`, this entire panel is hidden.

---

## 5. Editable Fields During Resubmission

Only specific fields can be updated on resubmission — this is intentional to prevent applicants from fundamentally changing the nature of their application:

| Field | Editable on Resubmit? |
|:------|:---------------------|
| `purpose` | ✅ Yes |
| `documentation` | ✅ Yes |
| `documentationFileId` | ✅ Yes |
| `licenseType` | ❌ No |
| `assetId` | ❌ No |
| `applicantId` | ❌ No |
| Type-specific fields (institution, company, etc.) | ❌ No |

---

## 6. Loop Iterations

The modification loop can cycle **multiple times**. The state allows:

```
PENDING → MODIFICATION_REQUIRED → PENDING → MODIFICATION_REQUIRED → PENDING → APPROVED
```

Each iteration creates new AuditLog entries, preserving a complete history of the negotiation. There is no hard limit on loop iterations, relying on the institutional discretion of the admin.

---

## 7. Agreement Generation on Final Approval

Once the admin is satisfied and clicks "Approve" (regardless of how many modification loops have occurred), `agreementService.js` generates the license contract:

```js
const generateAgreementText = (assetTitle, communityName, licenseType) => {
    return `LICENSE AGREEMENT

This Agreement is made regarding the cultural asset titled "${assetTitle}".
Community of Origin: ${communityName}
License Type: ${licenseType}
Duration: 1 year fixed

Terms and Conditions:
1. Non-exclusive right to use the asset per ${licenseType} guidelines.
2. Non-Transfer Clause: Non-transferable, cannot be sublicensed or sold.
3. Must attribute the ${communityName} community in all uses.
4. Valid for 1 year from the date of approval.

Approved and generated by DHAROHAR System.`;
};
```

The generated text is saved to `license.agreementText` and displayed to the applicant in their `MyLicenses` dashboard.
