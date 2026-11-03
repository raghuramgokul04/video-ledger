# Video Ledger 🎬

A clean, minimalist, multi-user video editing tracker built with **React**, **Vite**, **Tailwind CSS**, and **Supabase**.

## Highlights & Features

- **Public-First Access**: Anyone can visit the website and view all registered employee profiles without needing to log in.
- **Common Team Page**: Default homepage showing all editors, their avatar or initials, total video entries, in-progress count, and completed count with live search.
- **Individual Video Ledger**:
  - Exactly **four summary statistics**: `TODAY`, `THIS WEEK` (Monday to Sunday), `THIS MONTH`, and `ALL TIME`, dynamically recalculated based on status filters.
  - Exactly **three status filters**: `All`, `In Progress` (amber), and `Completed` (green).
  - Exactly **four tabs**: `Day`, `Week`, `Month`, and `Entries`.
  - Simple ledger-style rows with inline editing and delete confirmation.
- **Add to Ledger (Strictly 4 Fields)**:
  1. **Video Number / ID** (supports single or comma-separated numbers like `142, 143, 144` — each stored individually)
  2. **Editing Date** (defaults to today; prevents future dates)
  3. **Notes** (optional, max 140 characters)
  4. **Status** (`In Progress` or `Completed`)
- **Profile Management**: Change name, upload profile picture to Supabase Storage, or delete account.
- **View-Only Mode for Visitors**: Anyone can inspect other team members' ledgers, while add/edit/delete controls are protected both in the UI and at the database level.
- **Robust Security**: Enforced using PostgreSQL **Row Level Security (RLS)** in Supabase.
- **Authentic Theme**: Minimalist dark green/black aesthetic, mono typography, responsive on desktop and mobile.

---

## Tech Stack

- **Frontend**: React 18, Vite, React Router 6, Tailwind CSS, Lucide React
- **Backend / Database**: Supabase PostgreSQL, Supabase Auth, Supabase Storage
- **Security**: Postgres Row Level Security (RLS) policies

---

## Getting Started

### 1. Database Setup
Execute the complete schema and policies in [`supabase_setup.sql`](./supabase_setup.sql) inside your Supabase **SQL Editor**.

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install & Run
```bash
# Install dependencies
pnpm install

# Start local dev server
pnpm run dev
```

For full deployment and configuration steps, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

---

## Project Structure

```
Video Ledger/
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── index.html                # HTML entry point
├── package.json              # Dependencies and scripts
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.js        # Tailwind custom colors and font settings
├── vite.config.js            # Vite build configuration
├── vercel.json               # SPA routing configuration for Vercel
├── supabase_setup.sql        # Complete database schema, triggers, and RLS
├── SETUP_GUIDE.md            # Zero-to-production deployment guide
├── README.md                 # Project overview and documentation
└── src/
    ├── main.jsx              # React app bootstrap
    ├── App.jsx               # Routes definition
    ├── index.css             # Tailwind base & custom ledger classes
    ├── lib/
    │   └── supabase.js       # Supabase client initialization
    ├── contexts/
    │   └── AuthContext.jsx   # Authentication state and profile listener
    ├── components/
    │   ├── Navbar.jsx        # Navigation bar (Team, My Ledger, Profile, Login/Logout)
    │   ├── LedgerView.jsx    # Core ledger table, statistics, tabs, and form
    │   ├── ProtectedRoute.jsx# Auth route guard
    │   └── LoadingSpinner.jsx# Styled dark loading indicator
    └── pages/
        ├── TeamPage.jsx          # Public homepage with employee cards & search
        ├── LoginPage.jsx         # Sign in page
        ├── SignupPage.jsx        # Registration with optional avatar upload
        ├── ForgotPasswordPage.jsx# Password recovery email trigger
        ├── ResetPasswordPage.jsx # Password update page
        ├── MyLedgerPage.jsx      # Logged-in user's personal ledger
        ├── MyProfilePage.jsx     # Profile editing and account deletion
        └── PublicLedgerPage.jsx  # Read-only public ledger for any team member
```

