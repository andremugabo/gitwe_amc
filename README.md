# Integrated Platform for Church Administration & Record Management (Gitwe AMC)

Welcome to the **Gitwe Ministerial Centre (Gitwe AMC)** Digital Platform. This system is an integrated solution built for Seventh-day Adventist Church administration, record keeping, and elder training. It enforces role-based access control, localized multilingual translations, and data privacy safeguards across all ecclesiastical levels.

---

## 🚀 Technology Stack

### Frontend
- **Framework:** React 19 (JavaScript / ES6+)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Vanilla responsive utility styles)
- **Data Visualizations:** Recharts (Dynamic Bar, Area, and Pie charts displaying real-time metrics from the database)
- **Icons:** Lucide React
- **HTTP Client:** Axios (Integrated with dynamic JWT request headers, global error toaster, and a 401 session-expiry auto-redirect interceptor)
- **i18n Multilingual Support:** Custom context provider implementing English (`en`), Kinyarwanda (`kin`), and French (`fr`) mappings

### Backend
- **Runtime:** Node.js
- **Server Framework:** Express
- **ORM:** Prisma
- **Database:** PostgreSQL (Scoped permissions matching union, field, district, and church levels)
- **Real-Time Features:** Native WebSockets server (Chat, instant push notifications)
- **Security:** bcryptjs (Password hashing), JSON Web Tokens (JWT authentication), Helmet (HTTP security headers), and Express Rate Limiters (DDoS guards)
- **Documentation:** Swagger (Auto-scans routes to serve interactive specs at `/api-docs`)

---

## 📂 Project Architecture

```text
DONATHA_PROJECT/
├── FR_NFR/               # Requirements documents & LaTeX Thesis files
├── backend/              # Node.js Express server
│   ├── prisma/           # Prisma schemas, migrations, and seed scripts
│   └── src/
│       ├── controllers/  # API endpoint logic (auth, training, members, settings, etc.)
│       ├── middleware/   # JWT authorization, security checkers, error handlers
│       ├── routes/       # Express Router mappings with Swagger descriptions
│       ├── utils/        # Swagger configs, Prisma client initializers, WebSockets
│       └── index.js      # Server entry point
├── frontend/             # React application
│   ├── public/           # Manifest.json, sw.js (PWA service worker)
│   └── src/
│       ├── api/          # Axios configurations and 401 interceptors
│       ├── components/   # Dashboard widgets (Elder, Pastor, Union Admin, Field Secretary, Trainer)
│       ├── context/      # AuthContext & LanguageContext & WebSocketContext
│       ├── pages/        # Main route views (Login, Register, ResetPassword, Dashboard)
│       └── services/     # Decoupled API service layers (Service Pattern abstraction)
└── README.md             # Project roadmap & information (This file)
```

---

## 🛠️ Setup & Running Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL database instance (running on port `5432` with a database named `gitwedb`)

### 1. Database & Backend Configuration

1. **Verify PostgreSQL is running** and that a database named `gitwedb` exists.
2. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a `.env` file** and define your configuration:
   ```env
   PORT=5001
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gitwedb"
   JWT_SECRET="supersecretkey123"
   
   # Gmail SMTP Configuration
   EMAIL_USER="donatha.25874@auca.ac.rw"
   EMAIL_PASS="ukyl yhhg lxzz fvhk"
   ```
5. **Run migrations to initialize the schema**:
   ```bash
   npx prisma migrate dev --name init_platform
   ```
6. **Seed the database with hierarchy, users, FAQs, and settings**:
   ```bash
   node prisma/seed.js
   ```
7. **Start the development server**:
   ```bash
   npm run dev
   ```
   *The server runs on port `5001`. Swagger documentation is available at `http://localhost:5001/api-docs`.*

### 2. Frontend Configuration

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the client development server**:
   ```bash
   npm run dev
   ```
   *The application will open at `http://localhost:3000` (or another port specified by Vite).*

---

## 🔑 Seeding / Demo Credentials
To log in immediately, utilize the following seeded credentials:

| Role | Username / Email | Password | Scope Access |
|---|---|---|---|
| **Union Administrator** | `union-admin@gitweamc.org` | `admin123` | Global training schedule, settings, data exports, certificates |
| **Field Secretary** | `field-sec@gitweamc.org` | `field123` | Scoped field registrations, elder database access |
| **Pastor** | `pastor@gitweamc.org` | `pastor123` | Scoped district approvals, elder recommendations, chats |
| **Trainer / Lecturer** | `trainer@gitweamc.org` | `trainer123` | Attendance registries, test score inputs, course reviews |
| **Church Elder** | `elder@gitweamc.org` | `elder123` | Trainee portal, class materials downloads, digital certificates |

---

## 🛡️ Production & Performance Capabilities

1. **PWA Integration**: The application acts as a Progressive Web App. A service worker `sw.js` is registered to cache static content for instant offline availability.
2. **Auto-Logout Security**: If a user is inactive (no cursor moves, typing, clicks) for **1 minute**, the system automatically logs them out to secure their session.
3. **Centralized Toaster**: All error alerts, server successes, network issues, and WebSocket announcements route through a centralized, event-driven floating toast utility.
