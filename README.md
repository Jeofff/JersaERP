# JERSA ERP

**Enterprise Workforce & Business Management Platform** — a portfolio demo built to run entirely in the browser, with zero backend, zero build step, and zero install. Open the page and it works.

Live at: `https://<your-username>.github.io/JERSA-ERP/`

## What this is

A fictional company, **Jersa Trading Corporation** (construction supply, hardware, and distribution — 150 employees across 9 departments), runs its operations through JERSA ERP. The landing page offers two ways to experience it:

- **View as Administrator** — full company management, signed in as the General Manager.
- **View as Employee** — a personal portal, signed in as one employee (Miguel Torres, IT Support Specialist).

Both are fully interactive. Data lives in `localStorage`, seeded with realistic sample data the first time the page loads.

## Tech

Plain HTML5, CSS3, and vanilla JavaScript (ES Modules) — no framework, no npm, no bundler. Chart.js is loaded from a CDN for the dashboard charts. That's the entire dependency list.

```
JERSA-ERP/
├── index.html
├── css/            tokens, base, components, and per-experience layout styles
└── js/
    ├── app.js       entry point — wires up theme + router
    ├── router.js    minimal hash router (safe for GitHub Pages, no server rewrites)
    ├── store.js     localStorage-backed data layer
    ├── seed.js      sample company data for Jersa Trading Co.
    ├── theme.js     dark/light mode, persisted
    ├── utils.js     formatting helpers
    ├── payrollCalc.js  simplified PH payroll math (SSS/PhilHealth/Pag-IBIG/tax)
    ├── components/  shared UI: shells, KPI cards, charts, icons
    └── pages/       one file per screen (admin/, employee/)
```

## Running it locally

Since it uses ES Modules, open it through a local server rather than double-clicking `index.html` (browsers block module imports over `file://`):

```bash
cd JERSA-ERP
python3 -m http.server 8080
# then open http://localhost:8080
```

Any static server works — `npx serve`, VS Code's Live Server extension, etc.

## Deploying to GitHub Pages

```bash
cd JERSA-ERP
git init
git add .
git commit -m "JERSA ERP — Admin & Employee dashboards"
git branch -M main
git remote add origin https://github.com/<username>/JERSA-ERP.git
git push -u origin main
```

Then in the repo: **Settings → Pages → Source → Deploy from a branch → `main` / `root`**. The `.nojekyll` file is already included so GitHub doesn't try to run Jekyll over it.

## Build status — what's real right now

Built module by module, on purpose. A module only appears in the navigation once it is fully working — nothing in this project is a dead link or a fake page.

| Module | Status |
|---|---|
| Landing (role selection) | ✅ Built |
| Admin → Dashboard | ✅ Built — live KPIs and 5 charts computed from real seeded data |
| Admin → Employees | ✅ Built — search, filter, sort, pagination, add employee, detail drawer |
| Admin → Departments | ✅ Built — live headcount, budget, and payroll cost per department |
| Employee → Dashboard | ✅ Built — real clock in/out, attendance calendar, payslip snapshot, leave balance, announcements, holidays |
| Attendance (full module) | 🔜 Planned |
| Payroll (processing & payslips) | 🔜 Planned |
| Inventory | 🔜 Planned |
| Sales / Point of Sale | 🔜 Planned |
| Reports & Analytics | 🔜 Planned |
| Settings, Notifications, Audit Logs, Profile, Help Center | 🔜 Planned |

## Notes for the portfolio write-up

- Payroll math (SSS/PhilHealth/Pag-IBIG/withholding tax) is simplified for demonstration — not the exact current BIR tables.
- The employee attendance calendar's past days use a deterministic pattern (not real historical records, since there's no backend) — it's labeled as such in code, and it's stable across reloads rather than randomized on every visit.
- All data resets if the visitor clears their browser's localStorage for this site — that's expected for a static demo.
