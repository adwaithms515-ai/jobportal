# Premium MERN Stack Job Portal

A role-based recruitment platform connecting Candidates, Recruiters, and Admins. Built with MongoDB, Express, React, Node.js, Elasticsearch (for search optimization), Socket.IO (for real-time notifications), and Nodemailer.

---

## Key Features

1. **Candidate Module**: JWT signup, custom profile editor, bookmarks/saved jobs, resume PDF parser (AI heuristics), and application status tracking pipeline.
2. **Recruiter Module**: Company profiles, Job CRUD, applicants screening dashboard, applicant status updater logs, interview calendar scheduling, automated email alerts.
3. **Admin Module**: User moderation panel (suspend/delete), job approval dashboard, visual charting analytics (Recharts), audit logging table, system maintenance mode.
4. **Real-time Notifications**: Custom Socket.IO notification bell/dropdown for live candidate alerts.
5. **Search Engine**: Elasticsearch search wrapper with automatic MongoDB text-search fallback.

---

## Folder Structure

```text
jobportal/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Navbar, Sidebar, ProtectedRoute, Layout
│   │   ├── context/        # Auth, Socket, Notification state providers
│   │   ├── pages/          # Login, Register, Profile, Dashboards
│   │   └── utils/          # API fetch helper (JWT auth injector & refreshes)
└── server/                 # Node.js + Express Backend
    ├── config/             # DB, Elasticsearch, Socket.IO
    ├── controllers/        # Express MVC controllers
    ├── middleware/         # Auth, Upload, Errors
    ├── models/             # Mongoose schemas
    ├── routes/             # Versioned API routes (/api/v1)
    ├── scripts/            # Database seed script
    └── utils/              # PDF resume parser, email helpers
```

---

## Setup & Running Instructions

### 1. Prerequisite Installations
- Make sure you have **Node.js** (v18+) and **MongoDB** (running locally or a Mongoose URI).
- (Optional) **Elasticsearch** (v8+) running on `http://localhost:9200`. If unavailable, search gracefully falls back to MongoDB Text Search.

### 2. Configuration Setup
- Create `.env` files in both `client/` and `server/` directories based on the respective `.env.example` configurations.

### 3. Initialize & Seed Database
Navigate to the `server/` directory, install packages, and seed database:
```bash
cd server
npm install
npm run seed
```
*Seeding creates candidate users, recruiter companies, job posts (both approved and pending), and audit logs.*

### 4. Run Server
Start the Express server:
```bash
npm run dev
```
*The server will run on `http://localhost:5000`.*

### 5. Run Client
In a separate terminal, navigate to the `client/` directory and run the frontend:
```bash
cd client
npm install
npm run dev
```
*The React application will launch on `http://localhost:5173`.*

---

## Seed Accounts Created

- **Admin**: `admin@portal.com` (Password: `password123`)
- **Recruiter**: `recruiter1@techcorp.com` (Password: `password123`)
- **Candidate 1**: `john.doe@email.com` (Password: `password123`)
- **Candidate 2**: `jane.smith@email.com` (Password: `password123`)
