# Integrated Platform for Church Administration & Record Management (Gitwe AMC)

Welcome to the **Gitwe Ministerial Centre (Gitwe AMC)** Digital Platform. This system is an integrated solution built for Seventh-day Adventist Church administration, record keeping, and elder training. It enforces role-based access control, localized multilingual translations, and data privacy safeguards across all ecclesiastical levels.

---

## 🚀 Technology Stack

### Frontend
- **Framework:** React 19 (JavaScript / ES6+)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Vanilla responsive utility styles)
- **Icons:** Lucide React
- **HTTP Client:** Axios (Integrated with dynamic JWT request headers and a global `401` session-expiry auto-redirect interceptor)
- **i18n Multilingual Support:** Custom context provider implementing English (`en`), Kinyarwanda (`kin`), and French (`fr`) mappings

### Backend
- **Runtime:** Node.js
- **Server Framework:** Express
- **ORM:** Prisma
- **Database:** PostgreSQL (Scoped permissions matching union, field, district, and church levels)
- **Security:** bcryptjs (Password hashing) & JSON Web Tokens (JWT authentication)
- **Documentation:** Swagger (Auto-scans routes to serve interactive specs at `/api-docs`)

---

## 📂 Project Architecture

```text
DONATHA_PROJECT/
├── FR_NFR/               # Requirements documents & LaTeX Thesis files
├── backend/              # Node.js Express server
│   ├── prisma/           # Prisma schemas, migrations, and seed scripts
│   └── src/
│       ├── controllers/  # API endpoint logic (auth, training, members, etc.)
│       ├── middleware/   # JWT authorization, upload handlers
│       ├── routes/       # Express Router mappings with Swagger descriptions
│       ├── utils/        # Swagger configs, Prisma client initializers
│       └── index.js      # Server entry point
├── frontend/             # React application
│   └── src/
│       ├── api/          # Axios configurations and 401 interceptors
│       ├── components/   # Dashboard widgets (Elder, Pastor, Union, Secretary)
│       │   └── ui/       # Primitive UI elements (Button, Input, Modal, badges)
│       ├── context/      # AuthContext & LanguageContext (i18n Translation)
│       ├── pages/        # Main route views (Login, Register, ResetPassword, Dashboard)
│       └── services/     # Decoupled API service layers (Service Pattern abstraction)
└── README.md             # Project roadmap & information (This file)
```

---

## 🛠️ Setup & Running Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL database instance

### 1. Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the environment template and define your configuration:
   ```env
   PORT=5001
   DATABASE_URL="postgresql://username:password@localhost:5432/gitwe_amc"
   JWT_SECRET="your_secure_jwt_secret_token"
   ```
4. Run migrations and seed the database hierarchy:
   ```bash
   npx prisma migrate dev
   node prisma/seed.js
   ```
5. Start the development server using nodemon:
   ```bash
   npm run dev
   ```
   *The server runs on port `5001`. Swagger documentation is available at `http://localhost:5001/api-docs`.*

### 2. Frontend Configuration
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the client development server:
   ```bash
   npm run dev
   ```
   *The application will open at `http://localhost:5173` (or the local port specified by Vite).*

---

## 🔑 Seeding / Demo Credentials
To log in immediately, utilize the following seeded credentials matching church administrative hierarchy scopes:

| Role | Username / Email | Password | Scope Access |
|---|---|---|---|
| **Union Administrator** | `unionadmin@gitwe.org` | `password123` | Global training schedule, data export, certificates |
| **Field Secretary** | `fieldsec@gitwe.org` | `password123` | Local field registrations, attendance checks |
| **Pastor** | `pastor@gitwe.org` | `password123` | District oversight, elder training recommendations |
| **Church Elder** | `elder@gitwe.org` | `password123` | Trainee dashboard, study materials, digital certificates |

---

## 🌍 Multilingual Integration (Kinyarwanda, English, French)
The language can be toggled instantly from the dropdown inside the application header. Selecting a language:
- Persists user preferences inside the browser's `localStorage`.
- Dynamically translates authentication views, inputs, page metrics cards, navigation bars, and error strings.
- Gracefully falls back to English keys if Kinyarwanda or French values are missing.
