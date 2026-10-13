# Poultry Farming Management System

## Overview
A streamlined, full-stack enterprise resource planning (ERP) system designed to monitor core poultry farm operations, including flock management, daily production tracking, and operational analytics.

---

## Features

### 🐓 Batch Management
- Create and manage poultry batches
- Assign breeds and track initial vs. current bird counts
- Track batch status (active/completed)

### 📊 Production & Inventory Tracking
- **Egg Production**: Record daily egg collection and view production logs
- **Feed Management**: Record feed consumption per batch
- **Mortality Tracking**: Log daily bird deaths with automatic stock adjustments

### 📈 Operations Dashboard
- Real-time overview of active flocks, total birds, and production metrics

---

## Tech Stack
- **Full-Stack Framework**: SvelteKit 3 (Svelte 5 / Tailwind CSS / Server API Routes)
- **Database**: PostgreSQL
- **Runtime**: Node.js 22+

---

## Local Setup — Step by Step

### 1. Clone the repository
```sh
git clone https://github.com/Framanantsoa/poultry-ERP poultry-erp
cd poultry-erp/web-app
```

### 2. Install dependencies
```sh
npm install
```

### 3. Create & Edit the .env file
```code
# Drizzle
DATABASE_URL="postgres://user:password@host:port/db-name"
```

### 4. Run database migrations
```sh
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 5. Start the dev server
```sh
npm run dev
```
