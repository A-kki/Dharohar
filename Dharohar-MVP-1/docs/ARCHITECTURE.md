# 🏛️ System Architecture

Dharohar is built on a **MERN** (MongoDB, Express, React, Node) stack, utilizing a modern decoupled architecture.

---

## 🏗️ High-Level Component Diagram

```mermaid
graph TB
    subgraph "External World"
        U[User Browser]
    end
    
    subgraph "Frontend (React + Vite)"
        APP[App Routing]
        UI[Custom Components]
        AUTH_CTX[AuthContext]
        ST[Global State]
    end
    
    subgraph "Backend (Node + Express)"
        API[Express REST API]
        MID[Middleware: Auth, RoleGuard]
        CTRL[Controllers]
        SVC[Services]
        MOD[Mongoose Models]
    end
    
    subgraph "Database"
        MDB[(MongoDB Atlas)]
    end
    
    U <--> APP
    APP <--> UI
    UI <--> AUTH_CTX
    AUTH_CTX <--> API
    API <--> MID
    MID <--> CTRL
    CTRL <--> SVC
    SVC <--> MOD
    MOD <--> MDB
```

---

## 🛠️ Technology Stack Breakdown

| Layer | Technology | Primary Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18** | Component-based interactive user interface. |
| **Frontend Language** | **TypeScript** | Type safety and enhanced developer experience. |
| **Styling** | **Vanilla CSS** | Custom, high-performance modular styles. |
| **Build Tool** | **Vite** | Blazing-fast compilation and HMR. |
| **Backend Framework** | **Node.js + Express** | Scalable, event-driven RESTful API. |
| **Database** | **MongoDB** | NoSQL flexibility for document archival. |
| **ORM** | **Mongoose** | Schema-based modeling and validation. |
| **Authentication** | **JWT (JSON Web Tokens)** | Secure, stateless session management. |

---

## 🔐 Security & Access Control

### Role-Based Access Control (RBAC)
Dharohar implements a strict RBAC policy across four distinct roles:
1. **Community**: Submits heritage assets.
2. **Reviewer**: Validates and approves/rejects submissions.
3. **General**: Public users applying for research/commercial licenses.
4. **Admin**: Platform governors managing final license approvals.

### Data Protection
- **BCrypt**: Hashing and salting of user passwords.
- **Role Guards**: Backend middleware that intercepts requests and validates roles before execution.
- **Protected Routes**: Frontend navigation guards that prevent unauthorized access.

---

## 📚 Deep Dive Documentation

Detailed technical and governance narratives for each core system:

| Document | Contents |
|:---------|:---------|
| [ROLE_BASED_WORKFLOW.md](./ROLE_BASED_WORKFLOW.md) | Four-role model, per-role workflow diagrams, route guards, middleware chain |
| [STATE_MACHINE.md](./STATE_MACHINE.md) | Asset & License state machines, transition diagrams, enforcement gates, transaction safety |
| [DATA_VALIDATION.md](./DATA_VALIDATION.md) | Mongoose schema rules, service-layer business rule validation, error format |
| [GOVERNANCE_LOGIC.md](./GOVERNANCE_LOGIC.md) | The two governance gates, mandatory accountability, risk tiering, audit trail, no-automation principle |
| [LICENSE_MODIFICATION_LOOP.md](./LICENSE_MODIFICATION_LOOP.md) | Full modification loop (step-by-step), resubmission constraints, agreement generation |
