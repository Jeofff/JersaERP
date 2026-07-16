// JERSA ERP — pages/admin/departments.js

import { renderAdminShell } from '../../components/adminShell.js';
import { icons } from '../../components/icons.js';
import { getDB } from '../../store.js';
import { computePayroll } from '../../payrollCalc.js';
import { peso, number } from '../../utils.js';

export function renderAdminDepartments(root) {
  const content = renderAdminShell(root, 'departments');
  const db = getDB();

  content.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Departments</h1>
        <p>Headcount, budget, and payroll cost across all ${db.departments.length} departments.</p>
      </div>
    </div>
    <div class="grid-cols-3" id="deptGrid"></div>
  `;

  const grid = content.querySelector('#deptGrid');
  grid.innerHTML = db.departments.map((dept) => {
    const members = db.employees.filter((e) => e.dept === dept.id);
    const activeCount = members.filter((e) => e.status === 'Active').length;
    const payrollCost = members.reduce((s, e) => s + computePayroll(e).gross, 0);
    const budgetUsed = dept.budget ? Math.min(100, Math.round((payrollCost / dept.budget) * 100)) : 0;
    const overBudget = payrollCost > dept.budget;

    return `
      <div class="jr-card jr-card-pad">
        <div class="kpi-top" style="margin-bottom:12px;">
          <div class="kpi-icon" style="background:#4F46E51A; color:#4F46E5;">${icons.building(16)}</div>
          <span class="badge ${overBudget ? 'badge-danger' : 'badge-success'}">${budgetUsed}% of budget</span>
        </div>
        <h3 style="font-size:16px; margin-bottom:4px;">${dept.name}</h3>
        <p style="font-size:12.5px; color:var(--text-secondary); margin-bottom:16px;">Head: ${dept.head}</p>

        <div class="drawer-row"><dt>Employees</dt><dd>${number(members.length)} (${activeCount} active)</dd></div>
        <div class="drawer-row"><dt>Monthly budget</dt><dd class="tabular">${peso(dept.budget)}</dd></div>
        <div class="drawer-row" style="border-bottom:none;"><dt>Payroll cost</dt><dd class="tabular" style="color:${overBudget ? 'var(--jr-danger-500)' : 'var(--text-primary)'};">${peso(payrollCost)}</dd></div>
      </div>
    `;
  }).join('');
}
