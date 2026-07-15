# Sahod — Payroll System

A full-stack payroll system for Philippine teams: an **Admin dashboard** (full control) and a separate **Employer dashboard** (run payroll, view reports), both backed by a real Express API — with an Excel file (`payroll.xlsx`) as the database instead of a full SQL setup.

```
sahod-payroll-system/
├── backend/     Express API — auth, employees, departments, payroll, reports
└── frontend/    React (Vite) — Login, Admin dashboard, Employer dashboard
```

## How it's built

- **Backend:** Node.js + Express, JWT authentication, bcrypt password hashing, role-based access (`admin` / `employer`). Data is stored in and read from `backend/data/payroll.xlsx` using `exceljs` — no Postgres/MySQL to install.
- **Frontend:** React + Vite, React Router, Recharts for charts, Axios for the API, plain CSS (no build-step CSS framework, so there's nothing extra to configure).

## Demo accounts

Created automatically the first time the backend runs:

| Role     | Email              | Password    |
|----------|--------------------|-------------|
| Admin    | admin@sahod.ph     | admin123    |
| Employer | employer@sahod.ph  | employer123 |

Admins get full CRUD on employees/departments, payroll runs, reports, and can create more admin/employer accounts under **Users**. Employers get a read-mostly view of their team, plus the ability to generate and advance payroll runs and export reports.

## Run it locally

**1. Backend**
```bash
cd backend
cp .env.example .env
npm install
npm run dev        # or: npm start
```
The first run creates `backend/data/payroll.xlsx` automatically with the demo accounts and sample employees. Open it directly in Excel any time you want to look at the raw data.

API runs at `http://localhost:5000`.

**2. Frontend** (in a new terminal)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
App runs at `http://localhost:5173` and talks to the backend via `VITE_API_URL` in `frontend/.env`.

Sign in with either demo account — you'll land on `/admin` or `/employer` depending on the role.

## Resetting the data

```bash
cd backend
npm run seed        # only seeds if payroll.xlsx is missing
node src/seed.js --reset   # deletes and recreates payroll.xlsx from scratch
```

## Pushing to GitHub

```bash
cd sahod-payroll-system
git init
git add .
git commit -m "Sahod payroll system — Express + Excel backend, Admin/Employer dashboards"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

`backend/data/payroll.xlsx` and both `.env` files are gitignored on purpose — anyone who clones the repo runs `npm run dev` and gets a fresh seeded database, without committing password hashes or secrets to GitHub.

## Notes for the portfolio write-up

- SSS / PhilHealth / Pag-IBIG / withholding tax formulas are simplified for demonstration — not the exact current BIR tables. Worth a one-line disclaimer if this is client-facing.
- "Positions," "Attendance," and "Leaves" are shown in the sidebar as honest roadmap placeholders rather than fake working modules — everything you see actually run is real.
- Swapping the Excel store for Postgres/Prisma later only touches `backend/src/db/excelStore.js` — the routes call `getDB()` / `save()`, so the rest of the API doesn't need to change.
