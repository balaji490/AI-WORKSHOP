# NxtWave AI Workshop Growth Platform

A production-quality web application for managing the **"Build Your First AI Project in 60 Minutes"** workshop campaign. Built for the NxtWave Growth Intern Challenge.

## 🎯 Campaign Goals
- **500** student registrations
- **7-day** campaign window
- **₹2,000** maximum marketing budget
- Target: Final-year engineering students

## 🏗 Tech Stack

### Frontend
- React 19 + Vite + TypeScript
- Tailwind CSS v4
- Framer Motion (animations)
- Recharts (analytics charts)
- Lucide React (icons)

### Backend
- Node.js + Express + TypeScript
- MongoDB with Mongoose
- JWT authentication (HTTP-only cookies)
- Zod validation
- bcrypt password hashing
- Rate limiting

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and install

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start MongoDB

```bash
# If using local MongoDB
mongod --dbpath /data/db
```

### 3. Seed admin account

```bash
cd backend
npm run seed:admin
```

This creates:
- Admin account: `admin@nxtwave.tech` / `Admin@123456`
- Default workshop: "Build Your First AI Project in 60 Minutes"
- Default campaign with 8 channels

### 4. Start development servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📋 Application Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Workshop landing page |
| `/signup` | Public | Student registration |
| `/login` | Public | User login |
| `/r/:code` | Public | Referral redirect & attribution |
| `/onboarding` | Auth | Registration confirmation |
| `/dashboard` | Auth | Student dashboard |
| `/admin/login` | Public | Admin login |
| `/admin` | Admin | Growth dashboard |
| `/admin/registrations` | Admin | Registration management |
| `/admin/ambassadors` | Admin | Ambassador management |
| `/admin/campaigns` | Admin | Campaign & budget management |

## 🔐 Security Features

- bcrypt password hashing (12 rounds)
- JWT with HTTP-only cookies
- Token refresh flow
- Rate limiting on auth endpoints
- Server-side role authorization
- Zod input validation
- CORS configured for frontend origin
- Helmet security headers
- No sensitive data in responses

## 📊 Key Features

### For Students
- Public landing page (no login required)
- Account registration with validation
- Unique referral link generation
- WhatsApp/native sharing
- Referral activity tracking
- Referral leaderboard
- Profile management

### For Admins
- Real-time registration analytics
- Daily registration charts
- Channel performance tracking
- Budget management
- Ambassador management
- CSV export
- Message templates for promotion
- Workshop settings management

## 🗄 Database Models

1. **Users** — accounts with roles, referral codes
2. **Workshops** — configurable workshop details
3. **Registrations** — one per user per workshop (unique)
4. **Referrals** — attribution tracking with duplicate prevention
5. **Ambassadors** — campus ambassador records
6. **Campaigns** — growth campaign configuration
7. **CampaignChannels** — per-channel budgets and targets
8. **CampaignEvents** — campaign activity logging

## 📡 API Endpoints

### Auth
- `POST /api/auth/signup` — Create account
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `POST /api/auth/refresh` — Refresh token
- `GET /api/auth/me` — Current user
- `POST /api/auth/verify-email` — Verify email
- `POST /api/auth/forgot-password` — Initiate reset
- `POST /api/auth/reset-password` — Complete reset

### User
- `GET /api/user/profile` — Get profile
- `PUT /api/user/profile` — Update profile

### Workshops
- `GET /api/workshops` — List published workshops
- `GET /api/workshops/:id` — Get workshop details

### Registrations
- `POST /api/registrations` — Register for workshop
- `GET /api/registrations/my` — My registrations
- `GET /api/registrations/my/status` — Quick status check

### Referrals
- `GET /api/referrals/validate/:code` — Validate referral code
- `GET /api/referrals/my` — My referral stats
- `GET /api/referrals/leaderboard` — Public leaderboard

### Admin
- `GET /api/admin/stats` — Dashboard summary
- `GET /api/admin/registrations` — Paginated registrations
- `GET /api/admin/registrations/export` — CSV export
- `GET /api/admin/analytics/daily` — Daily chart data
- `GET /api/admin/analytics/channels` — Channel breakdown
- Campaign, channel, ambassador CRUD endpoints

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
```

### Backend (Render)
```bash
cd backend
npm run build
# Deploy with start command: node dist/index.js
```

### Environment Variables
Set all variables from `.env.example` in your hosting platform. Never commit `.env` files.

## ⚠️ Limitations

- Email verification is auto-approved in development mode
- Password reset tokens are logged to console (no email service configured)
- No real payment processing for budget tracking
- Analytics reflect actual database records only

## 📝 License

Built for the NxtWave Growth Intern Challenge.
