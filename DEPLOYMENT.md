# Deployment Guide for ArcticZero

This guide explains how to deploy the ArcticZero full-stack application for free using **Render.com**.

## 🏗️ Architecture

You will deploy 3 separate services/resources on Render:
1.  **PostgreSQL Database:** (Free Tier)
2.  **Web Service (Backend):** Node.js + Express
3.  **Static Site (Frontend):** React + Vite

---

## 🚀 Step 1: Database Setup

1.  Sign up/Log in to [Render.com](https://render.com).
2.  Click **New +** -> **PostgreSQL**.
3.  **Name:** `arctic-zero-db` (or similar).
4.  **Region:** Choose the one closest to you (e.g., Singapore, Oregon).
5.  **Plan:** Select **Free** (Ideal for hobby/hackathon projects).
6.  Click **Create Database**.
7.  **IMPORTANT:** Once created, copy the **Internal DB URL** (starts with `postgres://`) and **External DB URL**. You will need these later.

---

## 🖥️ Step 2: Deploy Backend

1.  Click **New +** -> **Web Service**.
2.  Connect your GitHub repository: `p3rem/Arcti-Zero`.
3.  **Configuration:**
    *   **Name:** `arctic-zero-api`
    *   **Root Directory:** `backend` (Important! This tells Render where the backend code lives)
    *   **Environment:** Node
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
    *   **Plan:** Free
4.  **Environment Variables (Advanced):**
    *   Click **Add Environment Variable**.
    *   `DATABASE_URL`: Paste the **Internal DB URL** from Step 1.
    *   `JWT_SECRET`: Generate a random string (e.g., `my_super_secret_key_123`).
    *   `GROQ_API_KEY`: Your Groq API Key.
    *   `PORT`: `10000` (Render default).
5.  Click **Create Web Service**.
6.  Wait for deployment to finish. Copy the **Service URL** (e.g., `https://arctic-zero-api.onrender.com`).

---

## 🎨 Step 3: Deploy Frontend

1.  Click **New +** -> **Static Site**.
2.  Connect the same GitHub repository: `p3rem/Arcti-Zero`.
3.  **Configuration:**
    *   **Name:** ``arctic-zero-web
    *   **Root Directory:** `frontend`
    *   **Build Command:** `npm install && npm run build`
    *   **Publish Directory:** `dist`
    *   **Plan:** Free
4.  **Environment Variables:**
    *   `VITE_API_URL`: Paste the **Backend Service URL** from Step 2 (e.g., `https://arctic-zero-api.onrender.com`).
5.  Click **Create Static Site**.

---

## 🔄 Step 4: Final Database Initialization

Since the database is empty, you need to create the tables.

1.  Go to your **Dashboard** -> Select your **Database**.
2.  Click on the **Connect** drop-down (top right) -> **External Connection** -> Copy the **PSQL Command**.
3.  Open your local terminal and paste the command (you need PostgreSQL installed locally).
    *   *Alternatively, use a tool like pgAdmin or DBeaver and connect using the External URL.*
4.  Once connected, run the contents of `backend/db/schema.sql`.
5.  (Optional) Run `backend/db/seed_db.js` contents locally pointing to the remote DB if you want seed data.

---

## ✅ Deployment Complete!

Visit your **Frontend URL** provided by Render. It should now be live and connected to your cloud backend and database!
