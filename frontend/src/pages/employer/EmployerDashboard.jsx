import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Users, Building2, Wallet, FileText, BarChart3,
  Plus, Download, TrendingUp, TrendingDown,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import client from '../../api/client.js';
import { Sidebar, Topbar, PageHeader, KPI, StatusPill, Toast, fmt } from '../../components/Shared.jsx';
import { PayslipCard } from '../admin/AdminDashboard.jsx';

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'employees', label: 'Employees', icon: Users },
  { key: 'departments', label: 'Departments', icon: Building2 },
  { key: 'payroll', label: 'Payroll', icon: Wallet },
  { key: 'payslips', label: 'Payslips', icon: FileText },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
];

export default function EmployerDashboard() {
  const [page, setPage] = useState('dashboard');
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [payslipEmpId, setPayslipEmpId] = useState(null);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2200); }

  async function loadAll() {
    setLoading(true);
    const [e, d, r] = await Promise.all([
      client.get('/employees'), client.get('/departments'), client.get('/payroll/runs'),
    ]);
    setEmployees(e.data); setDepartments(d.data); setRuns(r.data);
    if (!payslipEmpId && e.data.length) setPayslipEmpId(e.data[0].id);
    setLoading(false);
  }
  useEffect(() => { loadAll(); }, []);

  const totalPayroll = employees.reduce((s, e) => s + e.payroll.gross, 0);
  const totalDeductions = employees.reduce((s, e) => s + e.payroll.totalDeductions, 0);
  const avgSalary = employees.length ? totalPayroll / employees.length : 0;
  const activeDepartments = new Set(employees.map((e) => e.dept)).size;
  const upcomingRun = runs.find((r) => r.status === 'Draft');

  const byDept = useMemo(() => {
    const map = {};
    employees.forEach((e) => { map[e.dept] = (map[e.dept] || 0) + e.payroll.gross; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [employees]);

  const trend = [0.89, 0.91, 0.94, 0.97, 0.99, 1].map((mult, i) => ({
    month: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i], total: totalPayroll * mult,
  }));

  const filteredEmployees = employees.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));

  async function generatePayroll() {
    await client.post('/payroll/runs', {});
    showToast('Payroll run generated.');
    loadAll();
  }
  async function advanceRun(id) {
    await client.patch(`/payroll/runs/${id}/advance`);
    loadAll();
  }
  async function exportReport(format) {
    const res = await client.get(`/reports/export?format=${format}`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url; a.download = `payroll-report.${format}`; a.click();
    URL.revokeObjectURL(url);
  }

  const payslipEmp = employees.find((e) => e.id === payslipEmpId);

  return (
    <div className="shell">
      <Sidebar brand="Sahod" navItems={NAV} activeKey={page} onSelect={setPage} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar search={search} onSearch={(v) => { setSearch(v); setPage('employees'); }} />
        <main className="main">
          {loading ? (
            <div className="empty-state">Loading payroll data…</div>
          ) : (
            <>
              {page === 'dashboard' && (
                <div>
                  <PageHeader title="Dashboard" desc="Your team's payroll, at a glance." />
                  <div className="kpi-grid">
                    <KPI label="Total employees" value={employees.length} icon={Users} tint="#2563EB" sub={`${activeDepartments} active departments`} />
                    <KPI label="Total payroll" value={fmt(totalPayroll)} icon={Wallet} tint="#22C55E" sub="This cycle, gross" />
                    <KPI label="Average salary" value={fmt(avgSalary)} icon={TrendingUp} tint="#F59E0B" sub="Basic + allowances" />
                    <KPI label="Total deductions" value={fmt(totalDeductions)} icon={TrendingDown} tint="#EF4444" sub="SSS, PhilHealth, Pag-IBIG, tax" />
                  </div>
                  <div className="chart-grid">
                    <div className="card chart-card">
                      <h3>Monthly payroll trend</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={trend}>
                          <defs><linearGradient id="pt2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563EB" stopOpacity={0.35} /><stop offset="100%" stopColor="#2563EB" stopOpacity={0} /></linearGradient></defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                          <Tooltip formatter={(v) => fmt(v)} />
                          <Area type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={2} fill="url(#pt2)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="card chart-card">
                      <h3>Department payroll</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={byDept}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                          <Tooltip formatter={(v) => fmt(v)} />
                          <Bar dataKey="value" fill="#22C55E" radius={[4, 4, 0, 0]} maxBarSize={34} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="card kpi">
                    <span className="kpi-label">Upcoming payroll</span>
                    <div className="kpi-value">{upcomingRun ? upcomingRun.period : 'None scheduled'}</div>
                    <div className="kpi-sub">{upcomingRun ? `Status: ${upcomingRun.status}` : 'Generate a run from the Payroll tab'}</div>
                  </div>
                </div>
              )}

              {page === 'employees' && (
                <div>
                  <PageHeader title="Employees" desc={`${filteredEmployees.length} record(s) on file — view only`} />
                  <div className="card">
                    <div className="toolbar">
                      <div className="search-box" style={{ width: 260 }}>
                        <input placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} />
                      </div>
                    </div>
                    <table className="data-table">
                      <thead><tr><th>Employee</th><th>Department</th><th>Position</th><th>Basic</th><th>Net pay</th><th>Status</th><th></th></tr></thead>
                      <tbody>
                        {filteredEmployees.map((emp) => (
                          <tr key={emp.id}>
                            <td><div style={{ fontWeight: 600 }}>{emp.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.email}</div></td>
                            <td>{emp.dept}</td><td>{emp.position}</td>
                            <td className="tabular">{fmt(emp.basic)}</td>
                            <td className="tabular" style={{ fontWeight: 600 }}>{fmt(emp.payroll.net)}</td>
                            <td><StatusPill value={emp.status} /></td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => { setPayslipEmpId(emp.id); setPage('payslips'); }}>View payslip</button>
                            </td>
                          </tr>
                        ))}
                        {!filteredEmployees.length && <tr><td colSpan={7} className="empty-state">No employees match this search.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {page === 'departments' && (
                <div>
                  <PageHeader title="Departments" desc="Budget and headcount by department." />
                  <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {departments.map((d) => (
                      <div key={d.id} className="card kpi">
                        <div className="kpi-top"><span className="kpi-label">{d.name}</span><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.employeeCount} people</span></div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.description}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
                          <span>Head: <b>{d.head}</b></span><span className="tabular" style={{ fontWeight: 700 }}>{fmt(d.budget)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {page === 'payroll' && (
                <div>
                  <PageHeader title="Payroll" desc="Generate and release payroll runs for your team." action={<button className="btn btn-primary" onClick={generatePayroll}><Plus size={15} /> Generate payroll</button>} />
                  <div className="card">
                    <table className="data-table">
                      <thead><tr><th>Period</th><th>Generated</th><th>Employees</th><th>Total</th><th>Status</th><th></th></tr></thead>
                      <tbody>
                        {runs.slice().reverse().map((r) => (
                          <tr key={r.id}>
                            <td style={{ fontWeight: 600 }}>{r.period}</td><td>{r.generated}</td><td>{r.employeeCount}</td>
                            <td className="tabular" style={{ fontWeight: 600 }}>{fmt(r.total)}</td>
                            <td><StatusPill value={r.status} /></td>
                            <td style={{ textAlign: 'right' }}>
                              {r.status !== 'Released'
                                ? <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 10px' }} onClick={() => advanceRun(r.id)}>Advance status</button>
                                : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Complete</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {page === 'payslips' && payslipEmp && (
                <div>
                  <PageHeader title="Payslips" desc="Select an employee to view and print their payslip." />
                  <div className="payslip-grid">
                    <div className="card" style={{ height: 'fit-content' }}>
                      {employees.map((emp) => (
                        <button key={emp.id} className={'emp-pick' + (emp.id === payslipEmpId ? ' active' : '')} onClick={() => setPayslipEmpId(emp.id)}>
                          <div style={{ fontWeight: 600 }}>{emp.name}</div>
                          <div className="role">{emp.position} · {emp.dept}</div>
                        </button>
                      ))}
                    </div>
                    <PayslipCard emp={payslipEmp} />
                  </div>
                </div>
              )}

              {page === 'reports' && (
                <div>
                  <PageHeader title="Reports" desc="Payroll summary across your team." action={
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost" onClick={() => exportReport('csv')}><Download size={14} /> Export CSV</button>
                      <button className="btn btn-primary" onClick={() => exportReport('xlsx')}><Download size={14} /> Export Excel</button>
                    </div>
                  } />
                  <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <div className="card kpi"><span className="kpi-label">Payroll summary</span><div className="kpi-value tabular">{fmt(totalPayroll)}</div><div className="kpi-sub">Gross across {employees.length} employees</div></div>
                    <div className="card kpi"><span className="kpi-label">Government contributions</span><div className="kpi-value tabular">{fmt(employees.reduce((s, e) => s + e.payroll.sss + e.payroll.philhealth + e.payroll.pagibig, 0))}</div><div className="kpi-sub">SSS + PhilHealth + Pag-IBIG</div></div>
                    <div className="card kpi"><span className="kpi-label">Withholding tax</span><div className="kpi-value tabular">{fmt(employees.reduce((s, e) => s + e.payroll.tax, 0))}</div><div className="kpi-sub">This payroll cycle</div></div>
                  </div>
                  <div className="card">
                    <table className="data-table">
                      <thead><tr><th>Employee</th><th>Department</th><th>Gross</th><th>Deductions</th><th>Net pay</th></tr></thead>
                      <tbody>
                        {employees.map((e) => (
                          <tr key={e.id}>
                            <td style={{ fontWeight: 500 }}>{e.name}</td><td>{e.dept}</td>
                            <td className="tabular">{fmt(e.payroll.gross)}</td>
                            <td className="tabular" style={{ color: '#EF4444' }}>−{fmt(e.payroll.totalDeductions)}</td>
                            <td className="tabular" style={{ fontWeight: 600 }}>{fmt(e.payroll.net)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      <Toast message={toast} />
    </div>
  );
}
