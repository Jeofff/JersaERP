// JERSA ERP — pages/employee/dashboard.js

import { renderEmployeeShell } from '../../components/employeeShell.js';
import { icons } from '../../components/icons.js';
import { getDB, saveDB } from '../../store.js';
import { computePayroll } from '../../payrollCalc.js';
import { peso, formatDate, daysInMonth } from '../../utils.js';

export function renderEmployeeDashboard(root) {
  const content = renderEmployeeShell(root, 'dashboard');
  const db = getDB();
  const me = db.employees.find((e) => e.id === db.demoEmployeeId);
  const dept = db.departments.find((d) => d.id === me.dept);
  const payroll = computePayroll(me);

  const firstName = me.name.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  content.innerHTML = `
    <div class="employee-greeting">
      <div class="hello">${greeting}</div>
      <h1>Hi, ${firstName} 👋</h1>
      <p>${me.position} · ${dept ? dept.name : ''} · Jersa Trading Co.</p>
    </div>

    <div class="employee-grid">
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div class="emp-card punch-card" id="punchCard"></div>
        <div class="emp-card" id="calendarCard"></div>
        <div class="emp-card" id="payslipCard"></div>
      </div>
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div class="emp-card" id="leaveCard"></div>
        <div class="emp-card" id="announcementsCard"></div>
        <div class="emp-card" id="holidaysCard"></div>
      </div>
    </div>
  `;

  renderPunchCard(content, me);
  renderCalendarCard(content, me);
  renderPayslipCard(content, me, payroll);
  renderLeaveCard(content, me);
  renderAnnouncementsCard(content, db.announcements);
  renderHolidaysCard(content, db.holidays);
}

function renderPunchCard(content, me) {
  const card = content.querySelector('#punchCard');
  const att = me.todayAttendance;
  const now = new Date();
  const clockStr = now.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' });

  const statusBadge = att.status === 'Present' ? 'badge-success' : att.status === 'Late' ? 'badge-warning' : att.status === 'On Leave' ? 'badge-warning' : 'badge-neutral';

  card.innerHTML = `
    <div class="punch-clock tabular">${clockStr}</div>
    <div class="punch-date">${dateStr}</div>
    <span class="badge ${statusBadge} punch-status">${att.status}${att.timeIn ? ` · in ${att.timeIn}` : ''}${att.timeOut ? ` · out ${att.timeOut}` : ''}</span>
    <div class="punch-actions">
      <button class="btn btn-primary" id="clockInBtn" ${att.timeIn ? 'disabled' : ''}>${icons.clock(14)} Clock in</button>
      <button class="btn btn-secondary" id="clockOutBtn" ${!att.timeIn || att.timeOut ? 'disabled' : ''}>${icons.clock(14)} Clock out</button>
    </div>
    <div class="punch-log">Attendance is recorded for today only, in this browser.</div>
  `;

  card.querySelector('#clockInBtn').addEventListener('click', () => {
    const t = new Date();
    const isLate = t.getHours() > 9 || (t.getHours() === 9 && t.getMinutes() > 15);
    me.todayAttendance.timeIn = t.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
    me.todayAttendance.status = isLate ? 'Late' : 'Present';
    saveDB();
    renderPunchCard(content, me);
    renderCalendarCard(content, me);
  });
  card.querySelector('#clockOutBtn').addEventListener('click', () => {
    me.todayAttendance.timeOut = new Date().toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
    saveDB();
    renderPunchCard(content, me);
  });
}

function renderCalendarCard(content, me) {
  const card = content.querySelector('#calendarCard');
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDays = daysInMonth(year, month);
  const firstWeekday = new Date(year, month, 1).getDay();
  const todayNum = now.getDate();
  const dow = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  let cells = '';
  for (let i = 0; i < firstWeekday; i++) cells += `<div class="calendar-cell"></div>`;
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isToday = d === todayNum;
    const isFuture = d > todayNum;

    let cls = 'calendar-cell in-month';
    let label = d;
    if (isToday) {
      cls += ' today';
      const s = me.todayAttendance.status;
      if (s === 'Present' || s === 'Late') cls += ' present';
      else if (s === 'On Leave') cls += ' leave';
      else if (s === 'Absent') cls += ' absent';
    } else if (isFuture || isWeekend) {
      // no status yet / non-working day
    } else {
      const status = pseudoStatus(me.id, d);
      cls += ' ' + status;
    }
    cells += `<div class="${cls}">${label}</div>`;
  }

  card.innerHTML = `
    <h3>Attendance this month</h3>
    <div class="calendar-grid">
      ${dow.map((d) => `<div class="calendar-dow">${d}</div>`).join('')}
      ${cells}
    </div>
    <div class="legend">
      <span class="legend-item"><span class="legend-dot" style="background:var(--jr-success-500)"></span> Present</span>
      <span class="legend-item"><span class="legend-dot" style="background:var(--jr-warning-500)"></span> Leave</span>
      <span class="legend-item"><span class="legend-dot" style="background:var(--jr-danger-500)"></span> Absent</span>
    </div>
  `;
}

function renderPayslipCard(content, me, payroll) {
  const card = content.querySelector('#payslipCard');
  const next = nextPayDate();
  card.innerHTML = `
    <h3>Latest payslip snapshot</h3>
    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:10px;">
      <span class="muted">Net pay this cycle</span>
      <span style="font-size:22px; font-weight:800;" class="tabular">${peso(payroll.net)}</span>
    </div>
    <div style="display:flex; justify-content:space-between; font-size:12.5px; padding:6px 0; border-top:1px solid var(--border-subtle);">
      <span class="muted">Gross pay</span><span class="tabular">${peso(payroll.gross)}</span>
    </div>
    <div style="display:flex; justify-content:space-between; font-size:12.5px; padding:6px 0; border-top:1px solid var(--border-subtle);">
      <span class="muted">Total deductions</span><span class="tabular" style="color:var(--jr-danger-500)">−${peso(payroll.totalDeductions)}</span>
    </div>
    <div style="display:flex; justify-content:space-between; font-size:12.5px; padding:6px 0; border-top:1px solid var(--border-subtle);">
      <span class="muted">Next pay date</span><span>${next}</span>
    </div>
  `;
}

function renderLeaveCard(content, me) {
  const card = content.querySelector('#leaveCard');
  card.innerHTML = `
    <h3>Leave balance</h3>
    <div style="display:flex; align-items:baseline; gap:6px;">
      <span style="font-size:26px; font-weight:800;" class="tabular">${me.leaveBalance}</span>
      <span class="muted">days remaining this year</span>
    </div>
  `;
}

function renderAnnouncementsCard(content, announcements) {
  const card = content.querySelector('#announcementsCard');
  card.innerHTML = `
    <h3>${icons.megaphone(14)} Announcements</h3>
    ${announcements.map((a) => `
      <div class="announcement-item">
        <div class="a-title">${a.title}</div>
        <div class="a-body">${a.body}</div>
        <div class="a-meta">${a.author} · ${formatDate(a.date)}</div>
      </div>
    `).join('')}
  `;
}

function renderHolidaysCard(content, holidays) {
  const card = content.querySelector('#holidaysCard');
  const todayISO = new Date().toISOString().slice(0, 10);
  const upcoming = holidays.filter((h) => h.date >= todayISO).slice(0, 3);
  card.innerHTML = `
    <h3>${icons.calendar(14)} Upcoming holidays</h3>
    ${upcoming.length ? upcoming.map((h) => {
      const d = new Date(h.date + 'T00:00:00');
      return `
        <div class="holiday-item">
          <div class="holiday-date-chip">
            <span class="d">${d.getDate()}</span>
            <span class="m">${d.toLocaleDateString('en-PH', { month: 'short' })}</span>
          </div>
          <div>
            <div class="holiday-name">${h.name}</div>
            <div class="holiday-sub">${d.toLocaleDateString('en-PH', { weekday: 'long' })}</div>
          </div>
        </div>
      `;
    }).join('') : `<p class="muted">No upcoming holidays on record.</p>`}
  `;
}

function nextPayDate() {
  const now = new Date();
  const day = now.getDate();
  const target = day < 15 ? 15 : 1;
  const month = day < 15 ? now.getMonth() : now.getMonth() + 1;
  const d = new Date(now.getFullYear(), month, target === 1 ? 1 : 15);
  return d.toLocaleDateString('en-PH', { month: 'long', day: 'numeric' });
}

// Deterministic pseudo-status so past calendar days look realistic but stay
// stable across re-renders (no Math.random — same input, same output).
function pseudoStatus(employeeId, day) {
  let hash = 0;
  const str = employeeId + '-' + day;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  const r = hash % 100;
  if (r < 4) return 'absent';
  if (r < 10) return 'leave';
  return 'present';
}
