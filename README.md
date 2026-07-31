# 💸 Ledger - Decoupled Personal Expense Tracker Architecture

A high-performance, minimal personal finance dashboard split into decoupled `client/` and `server/` packages.

---

## 📁 Monorepo Folder Structure

```
expense-tracker/
├── client/                     # Next.js 15 Frontend Application
│   ├── app/                    # Next.js App Router (Dashboard, Analytics, Categories, Transactions, Settings, Profile)
│   ├── components/             # Reusable UI & Layout Components (Dock Sidebar, Navbar, Modals)
│   ├── features/               # Domain feature modules (Dashboard, Expenses, Analytics, Categories, Profile)
│   ├── lib/
│   │   ├── api/api-client.ts   # Decoupled API Client (supports NEXT_PUBLIC_API_URL)
│   │   ├── auth/auth-context.ts# Pluggable Auth Context (login, OAuth, logout slots)
│   │   ├── config/app-config.ts# Configurable Backend Connection Modes (LOCAL_PRISMA vs REMOTE_HTTP)
│   ├── package.json
│   └── tsconfig.json
│
├── server/                     # Standalone Express & Database Server
│   ├── src/                    # Backend API Controllers & Route Handlers
│   ├── prisma/                 # Prisma PostgreSQL Schema & Database Seed Scripts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
└── package.json                # Root Monorepo Scripts
```

---

## 🔌 How to Plug In Your Backend & Database

### Option A: Plug Your Custom API Server into `server/`
1. Place your backend API code inside `server/src/`.
2. Configure environment variables in `server/.env`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/ledger?schema=public"
   CORS_ORIGIN="http://localhost:3000"
   ```
3. In `client/.env`, point the frontend API client to your backend server:
   ```env
   NEXT_PUBLIC_BACKEND_MODE="REMOTE_HTTP"
   NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
   ```

### Option B: Run Next.js App Router + Prisma PostgreSQL locally in `client/`
1. Set `DATABASE_URL` in `client/.env`.
2. Run database migrations:
   ```bash
   cd client
   npx prisma db push
   ```

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### 2. Run Applications
```bash
# From the root directory:

# Start Next.js Frontend (Runs on http://localhost:3000)
npm run dev:client

# Start Express Backend Server (Runs on http://localhost:5000)
npm run dev:server
```
