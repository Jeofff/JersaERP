// JERSA ERP — pages/landing.js

import { icons } from '../components/icons.js';
import { navigate } from '../router.js';
import { getDB } from '../store.js';
import { getTheme, toggleTheme } from '../theme.js';

export function renderLanding(root) {
  const db = getDB();
  const theme = getTheme();

  root.innerHTML = `
    <div class="landing">
      <div class="landing-topbar">
        <div class="landing-wordmark"><div class="glyph">J</div><span>JERSA ERP</span></div>
        <button class="theme-toggle" id="themeToggle" title="Toggle theme">${theme === 'dark' ? icons.sun(16) : icons.moon(16)}</button>
      </div>

      <div class="landing-hero">
        <span class="landing-eyebrow">${icons.sparkles(13)} Enterprise Workforce &amp; Business Platform</span>
        <h1>Run <em>${db.company.name}</em> from one screen.</h1>
        <p>HR, payroll, inventory, and sales — a single workspace built the way real operations teams actually work. Pick a role below to explore it live.</p>
      </div>

      <div class="landing-cards">
        <button class="landing-card admin" id="cardAdmin">
          <div class="card-icon">${icons.building(22)}</div>
          <h2>View as Administrator</h2>
          <p class="desc">Complete company management — workforce, payroll, operations, and reporting in one dashboard.</p>
          <span class="persona-tag">Signed in as Jeoffrey Sarmiento, General Manager</span>
          <span class="card-footline">Enter admin workspace <span class="arrow">${icons.arrowRight(15)}</span></span>
        </button>
        <button class="landing-card employee" id="cardEmployee">
          <div class="card-icon">${icons.user(22)}</div>
          <h2>View as Employee</h2>
          <p class="desc">A calmer, personal portal — attendance, payslips, leave, and company updates.</p>
          <span class="persona-tag">Signed in as Miguel Torres, IT Support Specialist</span>
          <span class="card-footline">Enter employee portal <span class="arrow">${icons.arrowRight(15)}</span></span>
        </button>
      </div>

      <p class="landing-footnote">Runs entirely in your browser — data is stored in LocalStorage, nothing leaves this device.</p>
    </div>
  `;

  root.querySelector('#cardAdmin').addEventListener('click', () => navigate('/admin/dashboard'));
  root.querySelector('#cardEmployee').addEventListener('click', () => navigate('/employee/dashboard'));
  root.querySelector('#themeToggle').addEventListener('click', () => {
    const t = toggleTheme();
    root.querySelector('#themeToggle').innerHTML = t === 'dark' ? icons.sun(16) : icons.moon(16);
  });
}
