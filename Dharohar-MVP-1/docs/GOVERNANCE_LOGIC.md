# 🏛️ Governance Logic

DHAROHAR is not just a software application — it is an institutional instrument for protecting indigenous cultural knowledge. Every design decision is anchored to a governance philosophy: **no cultural asset moves through the system without explicit human institutional approval at each stage.**

---

## 1. The Two Governance Gates

The DHAROHAR platform has exactly **two governance checkpoints**, each guarded by a distinct role:

```
[Cultural Asset]                        [License Application]
      │                                          │
      ▼                                          ▼
┌─────────────┐                        ┌─────────────────┐
│  REVIEWER   │  ← Gate 1: Archival    │     ADMIN       │  ← Gate 2: Licensing
│  Decision   │                        │    Decision     │
└─────────────┘                        └─────────────────┘
```

**Gate 1 (Archival):** A `review`-role user must explicitly `APPROVE` an asset before it can enter the Marketplace or be licensed. No automation bypasses this gate.

**Gate 2 (Licensing):** An `admin`-role user must explicitly `APPROVE` a license before a general user gains access to protected media. No automation bypasses this gate.

---

## 2. Mandatory Accountability: Comment Requirements

The governance system enforces that all negative decisions — rejection or modification requests — require a **written institutional justification**. This creates a traceable chain of accountability:

| Decision | Comment Required? | Field Stored |
|:---------|:-----------------|:-------------|
| Asset APPROVED | No | — |
| Asset REJECTED | **Yes** | `reviewComment` |
| License APPROVED | No | — |
| License REJECTED | **Yes** | `adminComment` |
| License MODIFICATION_REQUIRED | **Yes** | `adminComment` |

Enforcement in `assetService.js` and `licenseService.js`:
```js
if (!adminComment || adminComment.trim() === '') {
    throw new Error('Rejection requires an admin comment'); // HTTP 400
}
```
Comments are **displayed back to the submitter/applicant** in their respective dashboards (`MySubmissions.tsx`, `MyLicenses.tsx`), creating a closed feedback loop.

---

## 3. Risk Tiering

Every cultural asset is assigned a `riskTier` at submission time by the community member:

| Tier | Value | Implication |
|:-----|:------|:------------|
| Low Sensitivity | `LOW` | Standard archival practices |
| Medium Sensitivity | `MEDIUM` | Extra care in review; flag for detailed metadata |
| High Sensitivity | `HIGH` | Strictest oversight; may inform license fee or access restrictions |

The `riskTier` is stored on the `Asset` document and is surfaced to reviewers and admins during their decision-making workflows.

---

## 4. Immutable Audit Trail

Every governance action — submission, approval, rejection, application, resubmission — creates a permanent entry in the **AuditLog** collection:

| Action | Triggered By | Logged Role |
|:-------|:------------|:------------|
| `LICENSE_APPLY` | General user applies | `general` |
| `LICENSE_APPROVE` | Admin approves | `admin` |
| `LICENSE_REJECT` | Admin rejects | `admin` |
| `LICENSE_MOD_REQ` | Admin requests modification | `admin` |
| `LICENSE_APPLY` | User resubmits (same action, audited) | `general` |

All audit entries are written **within the same transaction** as the state mutation. This guarantees that the log is always consistent — there is no scenario where a state changes but the audit log fails to record it.

---

## 5. Data Access Control Based on Governance State

The governance state directly controls what data users can access on both the frontend and backend:

### Asset Visibility
- **Community:** Sees own submissions regardless of status.
- **General / Public:** Only sees `APPROVED` assets in the Marketplace. `PENDING` and `REJECTED` assets are never surfaced.

### Media Access (license-gated)
The media file on an asset is never freely accessible to general users. Access is unlocked **only upon license approval**:

```
License.status === 'PENDING'              → media locked (🔒)
License.status === 'MODIFICATION_REQUIRED' → media locked (🔒)
License.status === 'REJECTED'             → media locked (🔒)
License.status === 'APPROVED'             → media unlocked (🔓) + agreementText shown
```

This is enforced on the **frontend** by inspecting the license status before rendering the media player, and on the **backend** by not exposing direct media URLs to unlicensed requests.

---

## 6. Governance Philosophy: No Automation

A deliberate design principle: **state transitions that affect cultural ownership or access are never automated.** The system does not auto-approve based on criteria, scheduled jobs, or thresholds. Every `APPROVED` decision is a conscious human action.

This reflects the institutional mandate of DHAROHAR: to serve as a trustworthy intermediary between indigenous communities and the broader world, with full human oversight at every critical junction.
