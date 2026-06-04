# 📂 Project File Structure

Dharohar follows a clean, modular directory structure designed for scalability and separation of concerns.

---

## 🏛️ Root Directory
- **`/frontend`**: The React/Vite application.
- **`/server`**: The Node/Express backend API.
- **`/Assets`**: Core brand assets (logos, images, symbols).
- **`Documentation.md`**: High-level platform overview.
- **`QUICKSTART.md`**: Local installation & setup guide.
- **`ARCHITECTURE.md`**: Tech stack & design patterns.

---

## 💻 Frontend (`/frontend`)
The frontend is structured by **features**, grouping related logic (state, UI, components) together.

- **`/src/features`**: Core application modules.
  - **`/auth`**: Login, registration, and session management.
  - **`/dashboard`**: Role-specific navigation and routing.
  - **`/public-explorer`**: 3D Landing page and community discovery.
  - **`/marketplace`**: Searchable archive for cultural assets.
- **`/src/components`**: Shared UI components (Layout, Loaders, Modals).
- **`/src/data`**: Mock data for development and initial prototyping.
- **`/src/services`**: Shared API utilities and Axios interceptors.
- **`/public`**: Static assets available to the client (favicon, logos).

---

## ⚙️ Server (`/server`)
The backend follows a classic **Controller-Service-Model** pattern.

- **`server.js`**: Application entry point (DB connection & listener).
- **`app.js`**: Express application configuration (middleware, routes).
- **`/routes`**: API endpoint definitions.
- **`/controllers`**: Request handling and response orchestration.
- **`/services`**: Business logic, data transformations, and agreement generation.
- **`/models`**: Mongoose schemas for Users, Assets, and Licenses.
- **`/middleware`**: Authentication filters and RBAC role guards.
- **`/config`**: Database and environment configuration.
