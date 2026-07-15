// JERSA ERP — pages/admin/dashboard.js

import { renderAdminShell } from '../../components/adminShell.js';
import { kpiCard } from '../../components/kpiCard.js';
import { icons } from '../../components/icons.js';
import { renderAreaChart, renderBarChart, renderLineChart } from '../../components/charts.js';
import { getDB } from '../../store.js';
import { computePayroll } from '../../payrollCalc.js';
import { peso, number, monthLabel } from '../../utils.js';

export function renderAdminDashboard(root) {
  const content = renderAdminShell(root, 'dashboard');
  const db = getDB();

  const activeEmployees = db.employees.filter((e) => e.status === 'Active');
  const presentToday = db.employees.filter((e) => ['Present', 'Late'].includes(e.todayAttendance.status)).length;
  const absentToday = db.employees.filter((e) => e.todayAttendance.status === 'Absent').length;
  const onLeaveToday = db.employees.filter((e) => e.todayAttendance.status === 'On Leave').length;
  const attendanceRate = db.employees.length ? Math.round((presentToday / db.employees.length) * 100) : 0;

  const payrollRows = activeEmployees.map((e) => ({ emp: e, p: computePayroll(e) }));
  const payrollCost = payrollRows.reduce((s, r) => s + r.p.gross, 0);

  const inventoryValue = db.inventory.reduce((s, i) => s + i.quantity * i.unitCost, 0);
  const todaySales = db.salesToday.reduce((s, t) => s + t.amount, 0);

  content.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p>Live snapshot of ${db.company.name} — workforce, payroll, inventory, and sales.</p>
      </div>
    </div>

    <div class="grid-cols-4" id="kpiGrid"></div>

    <div class="chart-grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
      <div class="jr-card chart-card">
        <div class="chart-card-head"><h3>Payroll trend</h3><span class="meta">Last 6 months</span></div>
        <div class="chart-canvas-wrap"><canvas id="chartPayroll"></canvas></div>
      </div>
      <div class="jr-card chart-card">
        <div class="chart-card-head"><h3>Revenue trend</h3><span class="meta">Last 6 months</span></div>
        <div class="chart-canvas-wrap"><canvas id="chartRevenue"></canvas></div>
      </div>
    </div>

    <div class="chart-grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
      <div class="jr-card chart-card">
        <div class="chart-card-head"><h3>Attendance trend</h3><span class="meta">Weekly presence rate</span></div>
        <div class="chart-canvas-wrap"><canvas id="chartAttendance"></canvas></div>
      </div>
      <div class="jr-card chart-card">
        <div class="chart-card-head"><h3>Employee growth</h3><span class="meta">Headcount, last 6 months</span></div>
        <div class="chart-canvas-wrap"><canvas id="chartGrowth"></canvas></div>
      </div>
    </div>

    <div style="margin-top:16px;">
      <div class="jr-card chart-card">
        <div class="chart-card-head"><h3>Inventory value trend</h3><span class="meta">Warehouse stock value, last 6 months</span></div>
        <div class="chart-canvas-wrap"><canvas id="chartInventory"></canvas></div>
      </div>
    </div>
  `;

  const kpiGrid = content.querySelector('#kpiGrid');
  kpiGrid.innerHTML = [
    kpiCard({ label: 'Total employees', value: number(db.employees.length), iconSvg: icons.users(15), tint: '#4F46E5', sub: `${new Set(db.employees.map((e) => e.dept)).size} departments` }),
    kpiCard({ label: 'Present today', value: number(presentToday), iconSvg: icons.calendarCheck(15), tint: '#16A34A', sub: `${attendanceRate}% attendance rate` }),
    kpiCard({ label: 'Absent', value: number(absentToday), iconSvg: icons.calendarX(15), tint: '#DC2626', sub: 'Unplanned absences today' }),
    kpiCard({ label: 'On leave', value: number(onLeaveToday), iconSvg: icons.calendarClock(15), tint: '#D97706', sub: 'Approved leave today' }),
    kpiCard({ label: 'Payroll cost', value: peso(payrollCost), iconSvg: icons.wallet(15), tint: '#4F46E5', sub: 'Gross, this cycle' }),
    kpiCard({ label: 'Inventory value', value: peso(inventoryValue), iconSvg: icons.box(15), tint: '#0891B2', sub: `${db.inventory.length} SKUs tracked` }),
    kpiCard({ label: "Today's sales", value: peso(todaySales), iconSvg: icons.cart(15), tint: '#16A34A', sub: `${db.salesToday.length} transactions` }),
    kpiCard({ label: 'Monthly revenue', value: peso(db.monthlyRevenue), iconSvg: icons.trendingUp(15), tint: '#D97706', sub: 'Month to date' }),
  ].join('');

  const months = [-5, -4, -3, -2, -1, 0].map((m) => monthLabel(m));

  renderAreaChart(content.querySelector('#chartPayroll'), {
    labels: months,
    data: [0.89, 0.91, 0.94, 0.97, 0.99, 1].map((m) => Math.round(payrollCost * m)),
    color: '#4F46E5',
    tooltipFormatter: (v) => peso(v),
  });
  renderAreaChart(content.querySelector('#chartRevenue'), {
    labels: months,
    data: [0.82, 0.88, 0.91, 0.95, 0.98, 1].map((m) => Math.round(db.monthlyRevenue * m)),
    color: '#0891B2',
    tooltipFormatter: (v) => peso(v),
  });
  renderLineChart(content.querySelector('#chartAttendance'), {
    labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'This wk'],
    data: [0.94, 0.96, 0.93, 0.97, 0.95, 1].map((m) => Math.min(100, Math.round(attendanceRate * m))),
    color: '#16A34A',
    tooltipFormatter: (v) => v + '%',
  });
  renderLineChart(content.querySelector('#chartGrowth'), {
    labels: months,
    data: [3, 2, 2, 1, 1, 0].map((d) => db.employees.length - d),
    color: '#D97706',
    tooltipFormatter: (v) => v + ' employees',
  });
  renderBarChart(content.querySelector('#chartInventory'), {
    labels: months,
    data: [0.90, 0.93, 0.95, 0.97, 0.99, 1].map((m) => Math.round(inventoryValue * m)),
    color: '#4F46E5',
    tooltipFormatter: (v) => peso(v),
  });
}
