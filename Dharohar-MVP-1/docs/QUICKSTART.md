# 🚀 Quick Start Guide

Follow these steps to get your local development environment up and running.

## 📋 Prerequisites
- **Node.js**: v18 or higher
- **MongoDB**: A running local instance or a MongoDB Atlas connection string
- **NPM**: Built-in with Node.js

---

## 🛠️ 1. Backend Setup

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `server/` directory:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your `MONGO_URI` and `JWT_SECRET`.

4. **Start the server**:
   ```bash
   npm run dev
   ```
   *The server will run on [http://localhost:5000](http://localhost:5000)*

---

## 💻 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   *The app will be available at [http://localhost:5173](http://localhost:5173)*

---

## 🚦 3. Verification

- Open your browser to `http://localhost:5173`.
- You should see the **Dharohar** landing page with the 3D Tree Explorer.
- Try navigating to the **/login** page to ensure the frontend routing is working.
