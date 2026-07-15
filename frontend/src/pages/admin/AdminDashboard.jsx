import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Users, Building2, Wallet, FileText, BarChart3, Settings as SettingsIcon,
  ShieldCheck, Plus, Pencil, Trash2, X, Download, Printer, TrendingUp, TrendingDown, CalendarClock,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import client from '../../api/client.js';
import { Sidebar, Topbar, PageHeader, KPI, StatusPill, RoadmapPage, Toast, fmt, fmtDec } from '../../components/Shared.jsx';

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'employees', label: 'Employees', icon: Users },
  { key: 'departments', label: 'Departments', icon: Building2 },
  { key: 'payroll', label: 'Payroll', icon: Wallet },
  { key: 'payslips', label: 'Payslips', icon: FileText },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
  { key: 'users', label: 'Users', icon: ShieldCheck },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function AdminDashboard() {
  const [page, setPage] = useState('dashboard');
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [runs, setRuns] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [payslipEmpId, setPayslipEmpId] = useState(null);

  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [empForm, setEmpForm] = useState(emptyEmpForm());

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'employer' });

  function emptyEmpForm() {
    return { name: '', dept: 'Marketing', position: '', type: 'Full-time', hired: '', status: 'Active', email: '', phone: '', basic: '' };
  }

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
  async function loadUsers() {
    const { data } = await client.get('/auth/users');
    setUsers(data);
  }

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { if (page === 'users') loadUsers(); }, [page]);

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
  const growth = [-3, -2, -2, -1, -1, 0].map((delta, i) => ({
    month: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i], headcount: Math.max(0, employees.length + delta),
  }));

  const filteredEmployees = employees.filter((e) =>
    (deptFilter === 'All' || e.dept === deptFilter) && e.name.toLowerCase().includes(search.toLowerCase())
  );

  function openAddEmp() { setEmpForm(emptyEmpForm()); setEditingEmp(null); setEmpModalOpen(true); }
  function openEditEmp(emp) {
    setEmpForm({ name: emp.name, dept: emp.dept, position: emp.position, type: emp.type, hired: emp.hired, status: emp.status, email: emp.email, phone: emp.phone, basic: emp.basic });
    setEditingEmp(emp.id); setEmpModalOpen(true);
  }
  async function saveEmp(e) {
    e.preventDefault();
    if (editingEmp) {
      await client.put(`/employees/${editingEmp}`, empForm);
      showToast('Employee updated.');
    } else {
      await client.post('/employees', empForm);
      showToast('Employee added.');
    }
    setEmpModalOpen(false);
    loadAll();
  }
  async function deleteEmp(id) {
    await client.delete(`/employees/${id}`);
    showToast('Employee removed.');
    loadAll();
  }
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
  async function createUser(e) {
    e.preventDefault();
    await client.post('/auth/users', userForm);
    showToast('Account created.');
    setUserModalOpen(false);
    setUserForm({ name: '', email: '', password: '', role: 'employer' });
    loadUsers();
  }
  async function deleteUser(id) {
    await client.delete(`/auth/users/${id}`);
    loadUsers();
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
                  <PageHeader title="Dashboard" desc="Payroll health across the whole system." />
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
                          <defs><linearGradient id="pt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563EB" stopOpacity={0.35} /><stop offset="100%" stopColor="#2563EB" stopOpacity={0} /></linearGradient></defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                          <Tooltip formatter={(v) => fmt(v)} />
                          <Area type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={2} fill="url(#pt)" />
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
                          <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={34} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="chart-grid">
                    <div className="card chart-card">
                      <h3>Employee growth</h3>
                      <ResponsiveContainer width="100%" height={190}>
                        <LineChart data={growth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="headcount" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="card kpi" style={{ justifyContent: 'center' }}>
                      <span className="kpi-label">Upcoming payroll</span>
                      <div className="kpi-value">{upcomingRun ? upcomingRun.period : 'None scheduled'}</div>
                      <div className="kpi-sub">{upcomingRun ? `Status: ${upcomingRun.status}` : 'Generate a run from the Payroll tab'}</div>
                    </div>
                  </div>
                </div>
              )}

              {page === 'employees' && (
                <div>
                  <PageHeader title="Employees" desc={`${filteredEmployees.length} record(s) on file`} action={<button className="btn btn-primary" onClick={openAddEmp}><Plus size={15} /> Add employee</button>} />
                  <div className="card">
                    <div className="toolbar">
                      <div className="search-box" style={{ width: 260 }}>
                        <input placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} />
                      </div>
                      <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <option>All</option>
                        {departments.map((d) => <option key={d.id}>{d.name}</option>)}
                      </select>
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
                            <td>
                              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                <button className="icon-btn" title="View payslip" onClick={() => { setPayslipEmpId(emp.id); setPage('payslips'); }}><FileText size={14} /></button>
                                <button className="icon-btn" title="Edit" onClick={() => openEditEmp(emp)}><Pencil size={14} /></button>
                                <button className="icon-btn" title="Delete" style={{ color: '#EF4444' }} onClick={() => deleteEmp(emp.id)}><Trash2 size={14} /></button>
                              </div>
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
                  <PageHeader title="Payroll" desc="Generate and release payroll runs." action={<button className="btn btn-primary" onClick={generatePayroll}><Plus size={15} /> Generate payroll</button>} />
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
                  <PageHeader title="Reports" desc="Payroll summary across all employees." action={
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

              {page === 'users' && (
                <div>
                  <PageHeader title="Users" desc="Admin and employer accounts that can sign in." action={<button className="btn btn-primary" onClick={() => setUserModalOpen(true)}><Plus size={15} /> Add account</button>} />
                  <div className="card">
                    <table className="data-table">
                      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td style={{ fontWeight: 600 }}>{u.name}</td><td>{u.email}</td>
                            <td><StatusPill value={u.role === 'admin' ? 'Completed' : 'Active'} /></td>
                            <td style={{ textAlign: 'right' }}><button className="icon-btn" style={{ color: '#EF4444' }} onClick={() => deleteUser(u.id)}><Trash2 size={14} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {page === 'settings' && (
                <div>
                  <PageHeader title="Settings" desc="Company details and payroll defaults." />
                  <div className="card card-pad" style={{ maxWidth: 480 }}>
                    <div className="field"><label>Company name</label><input defaultValue="Sarmiento Digital Studio" /></div>
                    <div className="field"><label>Payroll schedule</label><select defaultValue="Semi-monthly"><option>Weekly</option><option>Biweekly</option><option>Semi-monthly</option><option>Monthly</option></select></div>
                    <button className="btn btn-primary" onClick={() => showToast('Settings saved.')}>Save changes</button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {empModalOpen && (
        <div className="modal-overlay" onClick={() => setEmpModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h3 style={{ margin: 0, fontSize: 15 }}>{editingEmp ? 'Edit employee' : 'Add employee'}</h3><button className="icon-btn" onClick={() => setEmpModalOpen(false)}><X size={16} /></button></div>
            <form onSubmit={saveEmp} className="modal-body">
              <div className="field full"><label>Full name</label><input required value={empForm.name} onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })} /></div>
              <div className="field"><label>Department</label><select value={empForm.dept} onChange={(e) => setEmpForm({ ...empForm, dept: e.target.value })}>{departments.map((d) => <option key={d.id}>{d.name}</option>)}</select></div>
              <div className="field"><label>Position</label><input required value={empForm.position} onChange={(e) => setEmpForm({ ...empForm, position: e.target.value })} /></div>
              <div className="field"><label>Employment type</label><select value={empForm.type} onChange={(e) => setEmpForm({ ...empForm, type: e.target.value })}><option>Full-time</option><option>Part-time</option><option>Contract</option></select></div>
              <div className="field"><label>Date hired</label><input type="date" value={empForm.hired} onChange={(e) => setEmpForm({ ...empForm, hired: e.target.value })} /></div>
              <div className="field"><label>Basic salary (₱/mo)</label><input required type="number" min="1" value={empForm.basic} onChange={(e) => setEmpForm({ ...empForm, basic: e.target.value })} /></div>
              <div className="field"><label>Status</label><select value={empForm.status} onChange={(e) => setEmpForm({ ...empForm, status: e.target.value })}><option>Active</option><option>On Leave</option><option>Inactive</option></select></div>
              <div className="field full"><label>Email</label><input type="email" value={empForm.email} onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })} /></div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{editingEmp ? 'Save changes' : 'Add employee'}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEmpModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {userModalOpen && (
        <div className="modal-overlay" onClick={() => setUserModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h3 style={{ margin: 0, fontSize: 15 }}>Add account</h3><button className="icon-btn" onClick={() => setUserModalOpen(false)}><X size={16} /></button></div>
            <form onSubmit={createUser} className="modal-body">
              <div className="field full"><label>Full name</label><input required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} /></div>
              <div className="field full"><label>Email</label><input required type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /></div>
              <div className="field"><label>Password</label><input required type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} /></div>
              <div className="field"><label>Role</label><select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}><option value="employer">Employer</option><option value="admin">Admin</option></select></div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create account</button>
                <button type="button" className="btn btn-ghost" onClick={() => setUserModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast message={toast} />
    </div>
  );
}

export function PayslipCard({ emp }) {
  const p = emp.payroll;
  return (
    <div className="card card-pad">
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: 14, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Payslip</div>
          <h3 style={{ margin: '4px 0 2px' }}>{emp.name}</h3>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{emp.position} · {emp.dept}</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)' }}>EMP-{String(emp.id).padStart(4, '0')}<br />Pay period: Jul 2026</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <h4 style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Earnings</h4>
          {[['Basic pay', emp.basic], ['Transportation', emp.allowances.transportation], ['Meal', emp.allowances.meal], ['Communication', emp.allowances.communication], ['Overtime', emp.overtime], ['Bonus', emp.bonus]].map(([l, v]) => (
            <div key={l} className="ps-line"><span style={{ color: 'var(--text-muted)' }}>{l}</span><span className="tabular">{fmtDec(v)}</span></div>
          ))}
          <div className="ps-line" style={{ fontWeight: 700, borderBottom: 'none' }}><span>Gross pay</span><span className="tabular">{fmtDec(p.gross)}</span></div>
        </div>
        <div>
          <h4 style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Deductions</h4>
          {[['SSS', p.sss], ['PhilHealth', p.philhealth], ['Pag-IBIG', p.pagibig], ['Withholding tax', p.tax]].map(([l, v]) => (
            <div key={l} className="ps-line" style={{ color: '#EF4444' }}><span style={{ color: 'var(--text-muted)' }}>{l}</span><span className="tabular">−{fmtDec(v)}</span></div>
          ))}
          <div className="ps-line" style={{ fontWeight: 700, borderBottom: 'none' }}><span>Total deductions</span><span className="tabular">{fmtDec(p.totalDeductions)}</span></div>
        </div>
      </div>
      <div className="ps-net"><span style={{ fontWeight: 700 }}>Net pay</span><span className="amt tabular">{fmt(p.net)}</span></div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button className="btn btn-primary" onClick={() => window.print()}><Printer size={14} /> Print payslip</button>
        <button className="btn btn-ghost" onClick={() => window.print()}><Download size={14} /> Download PDF</button>
      </div>
    </div>
  );
}
