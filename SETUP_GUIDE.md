# Video Ledger — Complete Setup & Live Deployment Guide

This guide walks you step-by-step through setting up Supabase, configuring the database and storage, running the app locally, and deploying it live on Vercel.

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Supabase Project Setup](#2-supabase-project-setup)
3. [Database & Security Setup (SQL Script)](#3-database--security-setup-sql-script)
4. [Supabase Auth Settings & URL Configuration](#4-supabase-auth-settings--url-configuration)
5. [Local Development Setup](#5-local-development-setup)
6. [Verification & Feature Testing](#6-verification--feature-testing)
7. [Deploying Live on Vercel](#7-deploying-live-on-vercel)

---

## 1. Prerequisites
- **Node.js** (v18 or later recommended)
- **pnpm** or **npm**
- A free **[Supabase](https://supabase.com)** account
- A free **[Vercel](https://vercel.com)** account (for going live)
- A **GitHub** account

---

## 2. Supabase Project Setup

1. Go to [https://supabase.com](https://supabase.com) and log in.
2. Click **New Project** and choose your organization.
3. Set the project details:
   - **Name**: `Video Ledger` (or any name you prefer)
   - **Database Password**: Set a strong password (save it safely)
   - **Region**: Choose the region closest to your users
4. Click **Create new project** and wait 1–2 minutes for initialization.
5. In the left sidebar, navigate to **Project Settings** (gear icon) -> **API**.
6. Note down two values:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **Project API Keys** -> `anon` / `public` key

---

## 3. Database & Security Setup (SQL Script)

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar.
2. Click **New Query**.
3. Open the file `supabase_setup.sql` included in this repository.
4. Copy the entire contents and paste into the SQL Editor.
5. Click **Run** (or press `Ctrl+Enter`).
6. You should see `Success. No rows returned`.

### What this script creates:
- `public.profiles` table with id referencing `auth.users(id)`.
- `public.videos` table with user_id, video_number, editing_date, status ('progress' | 'done'), notes (max 140 chars).
- Automatic triggers to create user profile upon signup and keep `updated_at` current.
- **Row Level Security (RLS)** policies:
  - Anyone can view employee profiles and ledger entries publicly.
  - Authenticated users can insert, update, or delete **only their own** profile and videos.
- `avatars` storage bucket configured with public read access and owner-only upload permissions.

---

## 4. Supabase Auth Settings & URL Configuration

1. In Supabase, go to **Authentication** -> **URL Configuration**.
2. Set **Site URL**:
   - For local development: `http://localhost:5173`
   - When deployed live: `https://your-app-name.vercel.app`
3. Under **Redirect URLs**, add:
   - `http://localhost:5173/reset-password`
   - `https://your-app-name.vercel.app/reset-password` (after deploying)
4. (Optional) In **Authentication** -> **Providers** -> **Email**:
   - If you want users to be able to sign in immediately without waiting for an email confirmation in testing, toggle **Confirm email** off.
   - For production, keep **Confirm email** turned on.

---

## 5. Local Development Setup

1. Navigate to the project root:
   ```bash
   cd "Video Ledger"
   ```

2. Create your local `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *(On Windows PowerShell: `Copy-Item .env.example .env`)*

3. Open `.env` and fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. Install dependencies:
   ```bash
   pnpm install
   # or: npm install
   ```

5. Start the development server:
   ```bash
   pnpm run dev
   # or: npm run dev
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 6. Verification & Feature Testing

Test the application against all key requirements:

| Test Case | Expected Result |
| :--- | :--- |
| **1. Public First Navigation** | Opening `/` shows the Team page with public profiles. No login forced. |
| **2. Search Team** | Typing a name in the search bar filters employee cards dynamically. |
| **3. View Public Ledger** | Clicking "View Ledger →" on any employee shows their video entries, summary statistics, and tabs (view-only; no add/edit/delete buttons). |
| **4. Sign Up** | Registering with Full Name, Email, Password, and optional avatar creates an account and automatically generates a profile. |
| **5. Add to Ledger** | Only 4 fields are displayed (Video Number, Editing Date, Notes, Status). Entering comma-separated numbers (e.g. `101, 102`) creates multiple individual records. |
| **6. Summary Statistics** | 4 blocks (TODAY, THIS WEEK, THIS MONTH, ALL TIME) dynamically respond to the active status filter (All, In Progress, Completed). |
| **7. Tabs** | Day (grouped by date), Week (Monday–Sunday), Month (calendar month), and Entries (full list) display entries accurately. |
| **8. Edit & Delete** | Clicking a video number opens inline edit. Saving updates Supabase; deleting asks for confirmation. |
| **9. RLS Verification** | Logging in as User A prevents modifying User B's entries, even through API inspection. |
| **10. Profile Management** | Logged-in user can change name, upload avatar, or delete account in `/my-profile`. |

---

## 7. Deploying Live on Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Video Ledger app"
   git branch -M main
   git remote add origin https://github.com/your-username/video-ledger.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [https://vercel.com](https://vercel.com) and log in with GitHub.
   - Click **Add New...** -> **Project**.
   - Select your `video-ledger` repository.

3. **Configure Build & Environment Variables**:
   - **Framework Preset**: Vite (detected automatically).
   - Under **Environment Variables**, add:
     - `VITE_SUPABASE_URL`: Your Supabase Project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Public Key
   - Note: The included `vercel.json` already configures SPA routing (`rewrites: [ { source: "/(.*)", destination: "/index.html" } ]`).

4. **Deploy**:
   - Click **Deploy**.
   - Wait ~1 minute for the build to complete.
   - Click your deployment domain (e.g. `https://video-ledger.vercel.app`).

5. **Update Supabase Site URL**:
   - Go back to Supabase -> **Authentication** -> **URL Configuration**.
   - Update **Site URL** to `https://your-app-name.vercel.app`.
   - Add `https://your-app-name.vercel.app/reset-password` to **Redirect URLs**.

Your Video Ledger application is now live and fully operational!

