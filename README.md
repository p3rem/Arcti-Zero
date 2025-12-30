# ArcticZero - Carbon Footprint Tracking and Management Application
A comprehensive carbon footprint tracking and management application. This full-stack solution provides real-time analytics, emission tracking, smart recommendations, and reporting features for organizations.

## 🚀 Features

-   **Real-time Analytics**: Track carbon footprint with live data visualization.
-   **Emission Tracking**: Monitor electricity, transport, and waste emissions.
-   **Smart Recommendations**: AI-powered suggestions to reduce environmental impact.
-   **Downloadable Reports**: Generate PDF and Excel reports.
-   **User Management**: Manage users, roles, and organizational data.
-   **Comparison Tools**: Analyze trends year-over-year.

## 📸 Screenshots

### Landing Page
![Landing Page](project/landing%20page%20b.jpg)

### Dashboard Overview
![Dashboard](project/dashboard%20b.jpg)

### AI Recommendations
![Recommendations](project/recomm%20b.jpg)

### Mobile Responsive
<div style="display: flex; gap: 10px;">
  <img src="project/phone%20landing%20page%20b.jpeg" alt="Mobile Landing" width="300" />
  <img src="project/phone%20dashboard%20b.jpeg" alt="Mobile Dashboard" width="300" />
</div>

## 🛠️ Tech Stack

### Frontend
-   **React 18** (Vite)
-   **TypeScript**
-   **Tailwind CSS** + **shadcn/ui**
-   **React Query** & **Recharts**

### Backend
-   **Node.js** + **Express**
-   **PostgreSQL** (Database)
-   **JWT** (Authentication)
-   **Groq API** (AI Recommendations)

## 📋 Prerequisites

Ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v18+)
-   [PostgreSQL](https://www.postgresql.org/) (v14+)
-   npm (comes with Node.js)

## ⚙️ Quick Start

### 1. Database Setup
1.  Open pgAdmin or your terminal.
2.  Create a new database named `green_footprint_db`.
3.  Run the initialization script `backend/db/schema.sql`.

### 2. Configuration
1.  **Backend:**
    -   Copy `backend/.env.example` to `backend/.env`.
    -   Update credentials (DB URL, API Keys).

### 3. Installation & Run
The project is set up to run both frontend and backend concurrently.

1.  **Install All Dependencies:**
    Run this command in the root directory to install dependencies for root, frontend, and backend:
    ```bash
    npm run install:all
    ```

2.  **Start the Application:**
    Start both servers with a single command:
    ```bash
    npm run dev
    ```
    -   **Frontend:** `http://localhost:8080`
    -   **Backend:** `http://localhost:5000`

## 📦 Project Structure

```
ArcticZero/
├── backend/                # Express API & Backend Logic
│   ├── controllers/        # Request Handlers (Auth, Emissions, Reports, AI)
│   ├── routes/             # API Route Definitions
│   ├── middleware/         # Auth & Error Middleware
│   ├── db/                 # Database Config, Schema & Seeds
│   ├── .env.example        # Environment Variables Template
│   └── server.js           # App Entry Point
├── frontend/               # React + Vite Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   │   ├── dashboard/  # Charts & Stats Cards
│   │   │   ├── layout/     # Navbars & Sidebar
│   │   │   └── ui/         # Shadcn UI Base Components
│   │   ├── context/        # Global State (Auth, Search)
│   │   ├── hooks/          # Custom React Hooks
│   │   ├── lib/            # Utilities & API Client
│   │   ├── pages/          # Application Pages (Login, Dashboard, etc.)
│   │   ├── App.tsx         # Main App Component
│   │   └── main.tsx        # React Entry Point
│   ├── index.html          # HTML Template
│   └── tailwind.config.ts  # Tailwind Configuration
├── README.md               # Project Documentation
└── package.json            # Root configuration
```

## 📝 License

This project is created for hackathon purposes.
