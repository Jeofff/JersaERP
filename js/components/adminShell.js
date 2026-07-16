// JERSA ERP — components/adminShell.js

import { icons } from './icons.js';
import { toggleTheme, getTheme } from '../theme.js';
import { navigate } from '../router.js';
import { getDB } from '../store.js';

// Only modules that are fully built belong here. Add a new entry the day
// its page ships — never before.
export const ADMIN_NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'layoutDashboard', path: '/admin/dashboard' },
  { key: 'employees', label: 'Employees', icon: 'users', path: '/admin/employees' },
  { key: 'departments', label: 'Departments', icon: 'building', path: '/admin/departments' },
];

export function renderAdminShell(root, activeKey) {
  const db = getDB();
  const theme = getTheme();

  root.innerHTML = `
    <div class="admin-shell">
      <aside class="admin-sidebar">
        <div class="brand">
          <div class="glyph">J</div>
          <span>JERSA ERP</span>
        </div>
        <div class="env-tag">${db.company.name}</div>
        <nav class="admin-nav">
          <div class="admin-nav-group-label">Workspace</div>
          ${ADMIN_NAV.map((item) => `
            <button class="admin-navitem${item.key === activeKey ? ' active' : ''}" data-path="${item.path}">
              ${icons[item.icon](16)} ${item.label}
            </button>
          `).join('')}
        </nav>
        <div class="admin-sidebar-footer">
          <button class="admin-navitem" id="backToLanding">${icons.logOut(16)} Switch role</button>
        </div>
      </aside>
      <div class="admin-main">
        <header class="admin-topbar">
          <div class="crumb">Admin / <b>${ADMIN_NAV.find((n) => n.key === activeKey)?.label || ''}</b></div>
          <div class="admin-topbar-right">
            <div class="admin-search">${icons.search(14)} <span>Search…</span></div>
            <button class="theme-toggle" id="themeToggle" title="Toggle theme">${theme === 'dark' ? icons.sun(16) : icons.moon(16)}</button>
            <div class="admin-user">
              <div class="avatar">JS</div>
              <div class="meta"><div class="name">Jeoffrey Sarmiento</div><div class="role">Administrator</div></div>
            </div>
          </div>
        </header>
        <main class="admin-content">
          <div class="admin-content-inner" id="adminContentInner"></div>
        </main>
      </div>
    </div>
  `;

  root.querySelectorAll('.admin-navitem[data-path]').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.path));
  });
  root.querySelector('#backToLanding').addEventListener('click', () => navigate('/'));
  root.querySelector('#themeToggle').addEventListener('click', () => {
    const t = toggleTheme();
    root.querySelector('#themeToggle').innerHTML = t === 'dark' ? icons.sun(16) : icons.moon(16);
  });

  return root.querySelector('#adminContentInner');
}
