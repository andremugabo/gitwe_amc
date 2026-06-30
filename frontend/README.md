# Gitwe AMC Client Portal (Frontend)

This directory contains the React single page application for the Gitwe Ministerial Centre Digital Platform, built using Vite.

---

## 🛠️ Architecture & Core Features

### 1. Barrel Pattern Exports
All major folders export their contents via `index.js` files. Imports are grouped and readable:
```javascript
import { useAuth, useLanguage } from '../context';
import { Button, Input } from '../components/ui';
```

### 2. Services API Abstraction
Axios calls are fully decoupled from React components. All backend requests are channeled through services under `src/services/`:
- `authService.js` — Handles logging, registration, and email validations.
- `trainingService.js` — Schedules courses, registers elders, logs attendance, and recommends members.
- `memberService.js` — Manages church member records.
- `hierarchyService.js` — Pulls Union/Field/District/Church geography.
- `documentService.js` — Handles archives and PDF certificate downloads.

### 3. Translation Support (i18n)
A custom context provider (`LanguageContext.jsx`) implements three localized language libraries:
- **English (EN)**
- **Kinyarwanda (KIN)**
- **Français (FR)**
All views, input fields, badges, and dashboard headings adapt instantly when the language is changed. Selection is persisted in `localStorage`.

### 4. Resilient Error Handling
- **Axios interceptor**: Catches `401 Unauthorized` errors (session expiry) globally to clear client user data and redirect to `/login`.
- **Global ErrorBoundary**: Catches render crashes in components and displays a polished rollback warning with an app-reload function.

---

## 📂 Directories

```text
src/
├── api/          # Axios instance & interceptors
├── assets/       # Global CSS styles and images
├── components/   # Scoped dashboard modules (Elder, Pastor, Secretary, Union)
│   └── ui/       # Reusable primitives (Buttons, Inputs, Modals, Status Badges)
├── context/      # Authorization and translation states
├── pages/        # Main pages (Login, Register, Dashboard, ResetPassword)
└── services/     # Decoupled server requests logic
```

---

## 💻 Running the App

1. Install dependencies:
   ```bash
   npm install
   ```
2. Build production assets:
   ```bash
   npm run build
   ```
3. Run local dev server:
   ```bash
   npm run dev
   ```
