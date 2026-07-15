// JERSA ERP — components/employeeShell.js

import { icons } from './icons.js';
import { toggleTheme, getTheme } from '../theme.js';
import { navigate } from '../router.js';

// Only modules that are fully built belong here.
export const EMPLOYEE_NAV = [
  { key: 'dashboard', label: 'Dashboard', path: '/employee/dashboard' },
];

export function renderEmployeeShell(root, activeKey) {
  const theme = getTheme();

  root.innerHTML = `
    <div class="employee-shell">
      <header class="employee-topbar">
        <div class="employee-topbar-inner">
          <div class="employee-brand">
            <div class="glyph">J</div>
            <span>JERSA</span>
            <span class="portal-tag">Employee Portal</span>
          </div>
          <nav class="employee-nav">
            ${EMPLOYEE_NAV.map((item) => `
              <button class="employee-navitem${item.key === activeKey ? ' active' : ''}" data-path="${item.path}">${item.label}</button>
            `).join('')}
          </nav>
          <div class="employee-right">
            <button class="theme-toggle" id="themeToggle" title="Toggle theme">${theme === 'dark' ? icons.sun(16) : icons.moon(16)}</button>
            <button class="btn-icon" id="backToLanding" title="Switch role">${icons.logOut(15)}</button>
          </div>
        </div>
      </header>
      <main class="employee-content">
        <div class="employee-content-inner" id="employeeContentInner"></div>
      </main>
    </div>
  `;

  root.querySelectorAll('.employee-navitem[data-path]').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.path));
  });
  root.querySelector('#backToLanding').addEventListener('click', () => navigate('/'));
  root.querySelector('#themeToggle').addEventListener('click', () => {
    const t = toggleTheme();
    root.querySelector('#themeToggle').innerHTML = t === 'dark' ? icons.sun(16) : icons.moon(16);
  });

  return root.querySelector('#employeeContentInner');
}
