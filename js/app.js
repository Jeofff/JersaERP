// JERSA ERP — app.js

import { initTheme } from './theme.js';
import { initRouter, navigate } from './router.js';
import { renderLanding } from './pages/landing.js';
import { renderAdminDashboard } from './pages/admin/dashboard.js';
import { renderEmployeeDashboard } from './pages/employee/dashboard.js';

initTheme();

const routes = [
  { test: (p) => p === '/', render: renderLanding },
  { test: (p) => p === '/admin' || p === '/admin/dashboard', render: renderAdminDashboard },
  { test: (p) => p === '/employee' || p === '/employee/dashboard', render: renderEmployeeDashboard },
];

initRouter(routes, () => navigate('/'));
