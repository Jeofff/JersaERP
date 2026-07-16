// JERSA ERP — pages/admin/employees.js

import { renderAdminShell } from '../../components/adminShell.js';
import { icons } from '../../components/icons.js';
import { getDB, saveDB } from '../../store.js';
import { computePayroll } from '../../payrollCalc.js';
import { peso, number, formatDate } from '../../utils.js';

const PAGE_SIZE = 10;

export function renderAdminEmployees(root) {
  const content = renderAdminShell(root, 'employees');
  const db = getDB();
  const deptById = {};
  db.departments.forEach((d) => { deptById[d.id] = d.name; });

  const state = { search: '', dept: 'All', status: 'All', sortKey: 'name', sortDir: 'asc', page: 1 };

  content.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Employees</h1>
        <p>${db.employees.length} people across ${db.departments.length} departments at ${db.company.name}.</p>
      </div>
      <button class="btn btn-primary" id="addEmpBtn">${icons.plus(15)} Add employee</button>
    </div>

    <div class="grid-cols-4" id="empKpis" style="margin-bottom:16px;"></div>

    <div class="jr-card">
      <div class="toolbar">
        <div class="field-search">${icons.search(14)}<input id="empSearch" placeholder="Search by name or position"></div>
        <select class="field-select" id="empDeptFilter"><option value="All">All departments</option></select>
        <select class="field-select" id="empStatusFilter">
          <option value="All">All statuses</option>
          <option>Active</option><option>On Leave</option><option>Inactive</option>
        </select>
        <div class="toolbar-spacer"></div>
        <span class="toolbar-count" id="empCount"></span>
      </div>
      <div style="overflow-x:auto;">
        <table class="data-table" id="empTable">
          <thead>
            <tr>
              <th class="sortable" data-sort="name">Employee <span class="sort-arrow">&#8597;</span></th>
              <th class="sortable" data-sort="dept">Department <span class="sort-arrow">&#8597;</span></th>
              <th>Position</th>
              <th class="sortable" data-sort="status">Status <span class="sort-arrow">&#8597;</span></th>
              <th class="sortable" data-sort="basic">Basic <span class="sort-arrow">&#8597;</span></th>
              <th class="sortable" data-sort="net">Net pay <span class="sort-arrow">&#8597;</span></th>
              <th class="sortable" data-sort="hired">Hired <span class="sort-arrow">&#8597;</span></th>
            </tr>
          </thead>
          <tbody id="empTbody"></tbody>
        </table>
      </div>
      <div class="pagination" id="empPagination"></div>
    </div>

    <div class="drawer-overlay" id="empDrawerOverlay"><div class="drawer" id="empDrawer"></div></div>
  `;

  const deptFilterEl = content.querySelector('#empDeptFilter');
  db.departments.forEach((d) => {
    const opt = document.createElement('option');
    opt.value = d.id; opt.textContent = d.name;
    deptFilterEl.appendChild(opt);
  });

  renderKpis(content, db);

  function computeRows() {
    return db.employees
      .map((e) => ({ emp: e, p: computePayroll(e) }))
      .filter(({ emp }) => {
        const term = state.search.trim().toLowerCase();
        const matchesTerm = !term || emp.name.toLowerCase().includes(term) || emp.position.toLowerCase().includes(term);
        const matchesDept = state.dept === 'All' || emp.dept === state.dept;
        const matchesStatus = state.status === 'All' || emp.status === state.status;
        return matchesTerm && matchesDept && matchesStatus;
      })
      .sort((a, b) => {
        let av, bv;
        if (state.sortKey === 'dept') { av = deptById[a.emp.dept] || ''; bv = deptById[b.emp.dept] || ''; }
        else if (state.sortKey === 'net') { av = a.p.net; bv = b.p.net; }
        else if (state.sortKey === 'basic') { av = a.emp.basic; bv = b.emp.basic; }
        else { av = a.emp[state.sortKey]; bv = b.emp[state.sortKey]; }
        if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
        if (av < bv) return state.sortDir === 'asc' ? -1 : 1;
        if (av > bv) return state.sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }

  function renderTable() {
    const rows = computeRows();
    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    const pageRows = rows.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);

    content.querySelector('#empCount').textContent = `${rows.length} match${rows.length === 1 ? '' : 'es'}`;

    const tbody = content.querySelector('#empTbody');
    tbody.innerHTML = pageRows.map(({ emp, p }) => `
      <tr data-id="${emp.id}">
        <td data-label="Employee">
          <div class="cell-primary">${emp.name}</div>
          <div class="cell-sub">${emp.email}</div>
        </td>
        <td data-label="Department">${deptById[emp.dept] || 'Unassigned'}</td>
        <td data-label="Position">${emp.position}</td>
        <td data-label="Status">${statusPill(emp.status)}</td>
        <td data-label="Basic" class="tabular">${peso(emp.basic)}</td>
        <td data-label="Net pay" class="tabular cell-primary">${peso(p.net)}</td>
        <td data-label="Hired">${formatDate(emp.hired)}</td>
      </tr>
    `).join('') || `<tr><td colspan="7" class="empty-state">No employees match this search.</td></tr>`;

    tbody.querySelectorAll('tr[data-id]').forEach((tr) => {
      tr.addEventListener('click', () => openDrawer(tr.dataset.id));
    });

    content.querySelectorAll('.sortable').forEach((th) => {
      th.classList.toggle('sort-active', th.dataset.sort === state.sortKey);
      th.querySelector('.sort-arrow').innerHTML = th.dataset.sort === state.sortKey ? (state.sortDir === 'asc' ? '&#8593;' : '&#8595;') : '&#8597;';
    });

    content.querySelector('#empPagination').innerHTML = `
      <span class="pagination-info">Page ${state.page} of ${totalPages}</span>
      <div class="pagination-controls">
        <button class="btn-icon" id="prevPage" ${state.page === 1 ? 'disabled' : ''}>${icons.chevronLeft(14)}</button>
        <button class="btn-icon" id="nextPage" ${state.page === totalPages ? 'disabled' : ''}>${icons.chevronRight(14)}</button>
      </div>
    `;
    content.querySelector('#prevPage').addEventListener('click', () => { state.page--; renderTable(); });
    content.querySelector('#nextPage').addEventListener('click', () => { state.page++; renderTable(); });
  }

  content.querySelector('#empSearch').addEventListener('input', (e) => { state.search = e.target.value; state.page = 1; renderTable(); });
  content.querySelector('#empDeptFilter').addEventListener('change', (e) => { state.dept = e.target.value; state.page = 1; renderTable(); });
  content.querySelector('#empStatusFilter').addEventListener('change', (e) => { state.status = e.target.value; state.page = 1; renderTable(); });
  content.querySelectorAll('.sortable').forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (state.sortKey === key) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      else { state.sortKey = key; state.sortDir = 'asc'; }
      renderTable();
    });
  });

  function openDrawer(id) {
    const emp = db.employees.find((e) => e.id === id);
    if (!emp) return;
    const p = computePayroll(emp);
    const overlay = content.querySelector('#empDrawerOverlay');
    const drawer = content.querySelector('#empDrawer');

    drawer.innerHTML = `
      <div class="drawer-head">
        <div>
          <h3 style="margin:0; font-size:17px;">${emp.name}</h3>
          <p style="margin-top:4px; color:var(--text-secondary); font-size:12.5px;">${emp.position} &middot; ${deptById[emp.dept] || 'Unassigned'}</p>
        </div>
        <button class="btn-icon" id="closeDrawer">${icons.x(16)}</button>
      </div>
      <div class="drawer-body">
        <div class="drawer-section-title">Status</div>
        <div class="drawer-row"><dt>Employment status</dt><dd>${statusPill(emp.status)}</dd></div>
        <div class="drawer-row"><dt>Employment type</dt><dd>${emp.type}</dd></div>
        <div class="drawer-row"><dt>Date hired</dt><dd>${formatDate(emp.hired)}</dd></div>
        <div class="drawer-row"><dt>Leave balance</dt><dd>${emp.leaveBalance} days</dd></div>

        <div class="drawer-section-title">Contact</div>
        <div class="drawer-row"><dt>${icons.mail(13)} Email</dt><dd>${emp.email}</dd></div>
        <div class="drawer-row"><dt>${icons.phone(13)} Phone</dt><dd>${emp.phone}</dd></div>

        <div class="drawer-section-title">Payroll snapshot</div>
        <div class="drawer-row"><dt>Basic pay</dt><dd class="tabular">${peso(emp.basic)}</dd></div>
        <div class="drawer-row"><dt>Allowances</dt><dd class="tabular">${peso(p.allowanceTotal)}</dd></div>
        <div class="drawer-row"><dt>Gross pay</dt><dd class="tabular">${peso(p.gross)}</dd></div>
        <div class="drawer-row"><dt>Total deductions</dt><dd class="tabular" style="color:var(--jr-danger-500)">&minus;${peso(p.totalDeductions)}</dd></div>
        <div class="drawer-row"><dt style="font-weight:700; color:var(--text-primary);">Net pay</dt><dd class="tabular" style="font-weight:800; font-size:16px;">${peso(p.net)}</dd></div>
      </div>
    `;
    drawer.querySelector('#closeDrawer').addEventListener('click', closeDrawer);
    overlay.classList.add('is-open');
    overlay.addEventListener('click', onOverlayClick);
    document.addEventListener('keydown', onEscClose);
  }
  function onOverlayClick(e) {
    if (e.target.id === 'empDrawerOverlay') closeDrawer();
  }
  function onEscClose(e) { if (e.key === 'Escape') closeDrawer(); }
  function closeDrawer() {
    content.querySelector('#empDrawerOverlay').classList.remove('is-open');
    document.removeEventListener('keydown', onEscClose);
  }

  content.querySelector('#addEmpBtn').addEventListener('click', () => openAddModal(content, db, deptById, () => { renderKpis(content, db); renderTable(); }));

  renderTable();
}

function statusPill(status) {
  const map = { Active: 'badge-success', 'On Leave': 'badge-warning', Inactive: 'badge-neutral' };
  return `<span class="badge ${map[status] || 'badge-neutral'}">${status}</span>`;
}

function renderKpis(content, db) {
  const active = db.employees.filter((e) => e.status === 'Active').length;
  const onLeave = db.employees.filter((e) => e.status === 'On Leave').length;
  const kpis = content.querySelector('#empKpis');
  kpis.innerHTML = [
    kpi('Total employees', number(db.employees.length), icons.users(15), '#4F46E5'),
    kpi('Active', number(active), icons.calendarCheck(15), '#16A34A'),
    kpi('On leave', number(onLeave), icons.calendarClock(15), '#D97706'),
    kpi('Departments', number(db.departments.length), icons.building(15), '#0891B2'),
  ].join('');
}
function kpi(label, value, iconSvg, tint) {
  return `
    <div class="jr-card kpi-card">
      <div class="kpi-top"><span class="kpi-label">${label}</span><div class="kpi-icon" style="background:${tint}1A;color:${tint};">${iconSvg}</div></div>
      <div class="kpi-value tabular">${value}</div>
    </div>
  `;
}

function openAddModal(content, db, deptById, onSaved) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-head"><h3>Add employee</h3><button class="btn-icon" id="closeModal">${icons.x(16)}</button></div>
      <form id="addEmpForm" class="modal-body">
        <div class="field full"><label>Full name</label><input required id="fName"></div>
        <div class="field"><label>Department</label><select id="fDept">${db.departments.map((d) => `<option value="${d.id}">${d.name}</option>`).join('')}</select></div>
        <div class="field"><label>Position</label><input required id="fPosition"></div>
        <div class="field"><label>Employment type</label><select id="fType"><option>Full-time</option><option>Part-time</option><option>Contract</option></select></div>
        <div class="field"><label>Date hired</label><input type="date" id="fHired" value="${new Date().toISOString().slice(0, 10)}"></div>
        <div class="field"><label>Basic salary (monthly)</label><input required type="number" min="1" id="fBasic"></div>
        <div class="field"><label>Status</label><select id="fStatus"><option>Active</option><option>On Leave</option><option>Inactive</option></select></div>
        <div class="field"><label>Email</label><input type="email" id="fEmail"></div>
        <div class="modal-actions">
          <button type="submit" class="btn btn-primary" style="flex:1; justify-content:center;">Add employee</button>
          <button type="button" class="btn btn-secondary" id="cancelModal">Cancel</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  function close() { overlay.remove(); }
  overlay.querySelector('#closeModal').addEventListener('click', close);
  overlay.querySelector('#cancelModal').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  overlay.querySelector('#addEmpForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = overlay.querySelector('#fName').value.trim();
    const position = overlay.querySelector('#fPosition').value.trim();
    const basic = Number(overlay.querySelector('#fBasic').value);
    if (!name || !position || !basic) return;

    const id = 'emp_' + String(Math.max(...db.employees.map((e) => Number(e.id.replace('emp_', '')) || 0)) + 1).padStart(4, '0');
    db.employees.push({
      id, name,
      dept: overlay.querySelector('#fDept').value,
      position,
      type: overlay.querySelector('#fType').value,
      hired: overlay.querySelector('#fHired').value,
      status: overlay.querySelector('#fStatus').value,
      email: overlay.querySelector('#fEmail').value || (name.toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, '.') + '@jersatrading.ph'),
      phone: '0917 ' + Math.floor(200 + Math.random() * 700) + ' ' + Math.floor(1000 + Math.random() * 8999),
      basic,
      allowances: { transportation: 1500, meal: 1200, communication: 500 },
      overtime: 0, bonus: 0, leaveBalance: 15,
      todayAttendance: { status: 'Present', timeIn: '08:55 AM', timeOut: null },
    });
    saveDB();
    close();
    onSaved();
  });
}
