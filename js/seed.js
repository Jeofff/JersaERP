// JERSA ERP — seed.js
// Sample data for "Jersa Trading Corporation" (construction supply, hardware,
// and distribution). Employees are generated programmatically so the
// dataset can realistically scale to 150 people without hand-authoring
// every row — but two people are pinned to fixed IDs (the admin persona and
// the employee persona) so the two landing-page experiences stay stable.

import { todayISO } from './utils.js';

const DEPARTMENTS_DEF = [
  { id: 'dept_mgmt', name: 'Management', budget: 780000, weight: 3 },
  { id: 'dept_hr', name: 'HR', budget: 320000, weight: 6 },
  { id: 'dept_fin', name: 'Finance', budget: 410000, weight: 9 },
  { id: 'dept_wh', name: 'Warehouse', budget: 980000, weight: 28 },
  { id: 'dept_sales', name: 'Sales', budget: 720000, weight: 24 },
  { id: 'dept_mkt', name: 'Marketing', budget: 260000, weight: 8 },
  { id: 'dept_it', name: 'IT', budget: 340000, weight: 10 },
  { id: 'dept_ops', name: 'Operations', budget: 610000, weight: 20 },
  { id: 'dept_purch', name: 'Purchasing', budget: 300000, weight: 10 },
];

const POSITIONS_BY_DEPT = {
  dept_mgmt: [['General Manager', 65000], ['Operations Director', 58000], ['Finance Director', 56000]],
  dept_hr: [['HR Manager', 38000], ['HR Officer', 27000], ['Recruitment Specialist', 25000], ['Training Coordinator', 24000]],
  dept_fin: [['Finance Manager', 42000], ['Payroll Officer', 29000], ['Accountant', 30000], ['Accounts Payable Clerk', 22000], ['Billing Clerk', 21000]],
  dept_wh: [['Warehouse Supervisor', 34000], ['Inventory Clerk', 22000], ['Forklift Operator', 21000], ['Warehouse Staff', 18500], ['Stock Controller', 23500]],
  dept_sales: [['Sales Manager', 38000], ['Sales Associate', 21000], ['Account Executive', 26000], ['Sales Representative', 20000], ['Counter Sales Clerk', 19000]],
  dept_mkt: [['Marketing Manager', 36000], ['Marketing Associate', 23000], ['Content Specialist', 22000], ['Graphic Designer', 24000]],
  dept_it: [['IT Manager', 40000], ['IT Support Specialist', 24000], ['Systems Developer', 32000], ['Network Administrator', 28000]],
  dept_ops: [['Operations Manager', 39000], ['Logistics Coordinator', 26000], ['Delivery Driver', 19500], ['Dispatcher', 21000], ['Operations Staff', 19000]],
  dept_purch: [['Purchasing Manager', 37000], ['Purchasing Officer', 25000], ['Procurement Assistant', 21000]],
};

const MALE_FIRST = ['Miguel', 'Rafael', 'Carlo', 'Noel', 'Joshua', 'Ken', 'Ramon', 'Jeoffrey', 'Marco', 'Paolo', 'Enrico', 'Julius', 'Dennis', 'Arnel', 'Ferdinand', 'Ricky', 'Allan', 'Reynaldo', 'Alvin', 'Bryan', 'Christian', 'Daniel', 'Edgar', 'Francis', 'Gerald', 'Henry', 'Ivan', 'Jerome', 'Kevin', 'Leo'];
const FEMALE_FIRST = ['Bea', 'Diane', 'Trisha', 'Andrea', 'Mikaela', 'Patricia', 'Camille', 'Angela', 'Kristine', 'Joanna', 'Michelle', 'Grace', 'Charmaine', 'Divina', 'Ella', 'Faith', 'Gina', 'Hazel', 'Irene', 'Jasmine', 'Karen', 'Liza', 'Maricel', 'Nicole', 'Olivia', 'Precious', 'Queenie', 'Rowena', 'Shiela', 'Teresa'];
const SURNAMES = ['Santos', 'Cruz', 'Reyes', 'Mendoza', 'Torres', 'Ramos', 'Aquino', 'Bautista', 'Del Rosario', 'Villanueva', 'Fernandez', 'Garcia', 'Lopez', 'Gonzales', 'Perez', 'Sarmiento', 'Castro', 'Domingo', 'Flores', 'Manalo', 'Navarro', 'Pascual', 'Quinto', 'Rivera', 'Salazar', 'Tolentino', 'Uy', 'Valdez', 'Yap', 'Zamora'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function randomHireDate() {
  const start = new Date('2019-06-01').getTime();
  const end = Date.now();
  return new Date(start + Math.random() * (end - start)).toISOString().slice(0, 10);
}

function randomStatus() {
  const r = Math.random();
  if (r < 0.94) return 'Active';
  if (r < 0.98) return 'On Leave';
  return 'Inactive';
}

function randomTodayAttendance(status) {
  if (status !== 'Active') {
    return { status: 'On Leave', timeIn: null, timeOut: null };
  }
  const r = Math.random();
  if (r < 0.86) return { status: 'Present', timeIn: '08:5' + randInt(0, 9) + ' AM', timeOut: null };
  if (r < 0.93) return { status: 'Late', timeIn: '09:2' + randInt(0, 9) + ' AM', timeOut: null };
  if (r < 0.97) return { status: 'On Leave', timeIn: null, timeOut: null };
  return { status: 'Absent', timeIn: null, timeOut: null };
}

function makeEmployee(id, name, deptId, position, basic, opts) {
  opts = opts || {};
  const status = opts.status || randomStatus();
  return {
    id,
    name,
    dept: deptId,
    position,
    type: opts.type || (Math.random() < 0.88 ? 'Full-time' : (Math.random() < 0.5 ? 'Part-time' : 'Contract')),
    hired: opts.hired || randomHireDate(),
    status,
    email: name.toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, '.') + '@jersatrading.ph',
    phone: '0917 ' + randInt(200, 899) + ' ' + randInt(1000, 9999),
    basic,
    allowances: opts.allowances || { transportation: randInt(1000, 2000), meal: randInt(1000, 1500), communication: Math.random() < 0.5 ? randInt(500, 1000) : 0 },
    overtime: Math.random() < 0.3 ? randInt(300, 1800) : 0,
    bonus: Math.random() < 0.15 ? randInt(1000, 4000) : 0,
    leaveBalance: randInt(3, 15),
    todayAttendance: opts.todayAttendance || randomTodayAttendance(status),
  };
}

function generateEmployees() {
  const employees = [];
  const totalTarget = 150;
  const totalWeight = DEPARTMENTS_DEF.reduce((s, d) => s + d.weight, 0);

  // Two pinned personas the two landing-page experiences depend on.
  employees.push(makeEmployee(
    'emp_0001', 'Jeoffrey Sarmiento', 'dept_mgmt', 'General Manager', 68000,
    { type: 'Full-time', hired: '2019-06-03', status: 'Active', todayAttendance: { status: 'Present', timeIn: '08:02 AM', timeOut: null }, allowances: { transportation: 3000, meal: 2000, communication: 1500 } }
  ));
  employees.push(makeEmployee(
    'emp_0002', 'Miguel Torres', 'dept_it', 'IT Support Specialist', 26000,
    { type: 'Full-time', hired: '2022-09-05', status: 'Active', todayAttendance: { status: 'Present', timeIn: '08:47 AM', timeOut: null }, allowances: { transportation: 1500, meal: 1500, communication: 1000 } }
  ));

  var counter = 3;
  DEPARTMENTS_DEF.forEach((dept) => {
    var count = Math.round((dept.weight / totalWeight) * (totalTarget - 2));
    if (dept.id === 'dept_mgmt') count = Math.max(0, count - 1);
    if (dept.id === 'dept_it') count = Math.max(0, count - 1);

    for (var i = 0; i < count; i++) {
      var isMale = Math.random() < 0.55;
      var first = isMale ? pick(MALE_FIRST) : pick(FEMALE_FIRST);
      var last = pick(SURNAMES);
      var name = first + ' ' + last;
      var posDef = pick(POSITIONS_BY_DEPT[dept.id]);
      var position = posDef[0];
      var baseSalary = posDef[1];
      var basic = Math.round((baseSalary + randInt(-1500, 2500)) / 500) * 500;
      var id = 'emp_' + String(counter).padStart(4, '0');
      employees.push(makeEmployee(id, name, dept.id, position, basic));
      counter++;
    }
  });

  while (employees.length < totalTarget) {
    var d = pick(DEPARTMENTS_DEF.filter((x) => x.id !== 'dept_mgmt'));
    var isMale2 = Math.random() < 0.55;
    var first2 = isMale2 ? pick(MALE_FIRST) : pick(FEMALE_FIRST);
    var posDef2 = pick(POSITIONS_BY_DEPT[d.id]);
    var basic2 = Math.round((posDef2[1] + randInt(-1000, 1500)) / 500) * 500;
    employees.push(makeEmployee('emp_' + String(counter).padStart(4, '0'), first2 + ' ' + pick(SURNAMES), d.id, posDef2[0], basic2));
    counter++;
  }
  if (employees.length > totalTarget) employees.length = totalTarget;

  return employees;
}

function assignDepartmentHeads(employees, departments) {
  departments.forEach((dept) => {
    var seniorTitles = ['Manager', 'Director', 'Supervisor'];
    var candidates = employees.filter((e) => e.dept === dept.id && seniorTitles.some((t) => e.position.includes(t)));
    var head = candidates[0] || employees.find((e) => e.dept === dept.id);
    dept.head = head ? head.name : 'Unassigned';
  });
}

export function buildSeed() {
  const departments = DEPARTMENTS_DEF.map((d) => ({ id: d.id, name: d.name, budget: d.budget }));
  const employees = generateEmployees();
  assignDepartmentHeads(employees, departments);

  const inventory = [
    { id: 'inv_001', name: 'Portland Cement 40kg', sku: 'CEM-040', category: 'Cement & Aggregates', quantity: 8400, unitCost: 245, reorderLevel: 1200 },
    { id: 'inv_002', name: 'Deformed Steel Bar 10mm', sku: 'RBAR-10', category: 'Steel & Rebar', quantity: 12600, unitCost: 185, reorderLevel: 1800 },
    { id: 'inv_003', name: 'CHB Hollow Block 4"', sku: 'CHB-04', category: 'Masonry', quantity: 36500, unitCost: 12.5, reorderLevel: 5000 },
    { id: 'inv_004', name: 'PVC Pipe 4" x 10ft', sku: 'PVC-410', category: 'Plumbing', quantity: 3400, unitCost: 320, reorderLevel: 800 },
    { id: 'inv_005', name: 'GI Sheet Gauge 26', sku: 'GIS-26', category: 'Roofing', quantity: 2100, unitCost: 480, reorderLevel: 600 },
    { id: 'inv_006', name: 'Marine Plywood 4x8 1/2"', sku: 'PLY-812', category: 'Lumber', quantity: 1560, unitCost: 890, reorderLevel: 400 },
    { id: 'inv_007', name: 'Electrical Wire THHN #12 (100m)', sku: 'WIR-12', category: 'Electrical', quantity: 950, unitCost: 2650, reorderLevel: 250 },
    { id: 'inv_008', name: 'Latex Paint White 4L', sku: 'PNT-W4', category: 'Paint & Finishes', quantity: 1280, unitCost: 620, reorderLevel: 300 },
    { id: 'inv_009', name: 'Common Wire Nail 1kg', sku: 'NAIL-01', category: 'Hardware', quantity: 4800, unitCost: 78, reorderLevel: 1000 },
    { id: 'inv_010', name: 'Safety Helmet (Hard Hat)', sku: 'PPE-HH1', category: 'Safety & PPE', quantity: 640, unitCost: 340, reorderLevel: 200 },
    { id: 'inv_011', name: 'Angle Bar 2x2 (6m)', sku: 'ANGB-22', category: 'Steel & Rebar', quantity: 2200, unitCost: 410, reorderLevel: 500 },
    { id: 'inv_012', name: 'Tile Adhesive 25kg', sku: 'TAD-025', category: 'Cement & Aggregates', quantity: 1900, unitCost: 265, reorderLevel: 400 },
  ];

  const today = todayISO();
  const salesToday = [
    sale('s1', today, '08:12', 124500, 'POS'), sale('s2', today, '08:41', 32000, 'POS'),
    sale('s3', today, '09:15', 289000, 'Online'), sale('s4', today, '09:52', 67500, 'POS'),
    sale('s5', today, '10:20', 45200, 'POS'), sale('s6', today, '10:58', 156000, 'Online'),
    sale('s7', today, '11:33', 98000, 'POS'), sale('s8', today, '13:08', 156300, 'POS'),
    sale('s9', today, '14:02', 43000, 'Online'), sale('s10', today, '14:47', 210500, 'POS'),
    sale('s11', today, '15:30', 76800, 'POS'), sale('s12', today, '16:10', 39500, 'Online'),
  ];

  const announcements = [
    { id: 'ann_1', title: 'Mid-year performance reviews start August 1', body: 'Department heads will schedule one-on-one sessions with each team member over the first two weeks of August. Check your calendar invite for the exact slot.', date: daysAgoISO(2), author: 'HR Department' },
    { id: 'ann_2', title: 'New warehouse safety protocol', body: 'Hard hats and safety vests are now mandatory on the warehouse floor at all times, including for visitors. Coordinate with your supervisor for spare gear.', date: daysAgoISO(5), author: 'Warehouse Department' },
    { id: 'ann_3', title: '13th month pay computation schedule', body: 'Finance will release the 13th month pay computation sheet by the last week of November. Reach out to the Payroll Officer for any questions.', date: daysAgoISO(9), author: 'Finance Department' },
    { id: 'ann_4', title: 'New procurement portal for suppliers', body: 'Purchasing has rolled out a new supplier intake form to speed up vendor onboarding. Existing suppliers do not need to resubmit documents.', date: daysAgoISO(14), author: 'Purchasing Department' },
  ];

  const holidays = buildHolidayList();

  return {
    company: { name: 'Jersa Trading Corporation', tagline: 'Construction Supply, Hardware and Distribution', founded: 2019 },
    departments,
    employees,
    inventory,
    salesToday,
    monthlyRevenue: 18650000,
    announcements,
    holidays,
    demoEmployeeId: 'emp_0002',
    adminEmployeeId: 'emp_0001',
  };
}

function sale(id, date, time, amount, channel) {
  return { id, date, time, amount, channel };
}

function daysAgoISO(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function buildHolidayList() {
  const year = new Date().getFullYear();
  const raw = [
    ['New Year Day', '01-01'], ['EDSA People Power', '02-25'], ['Araw ng Kagitingan', '04-09'],
    ['Labor Day', '05-01'], ['Independence Day', '06-12'], ['Ninoy Aquino Day', '08-21'],
    ['National Heroes Day', '08-25'], ['Bonifacio Day', '11-30'], ['Christmas Day', '12-25'],
    ['Rizal Day', '12-30'], ['New Year Eve', '12-31'],
  ];
  const list = [];
  [year, year + 1].forEach((y) => {
    raw.forEach(([name, md]) => list.push({ name, date: `${y}-${md}` }));
  });
  return list.sort((a, b) => a.date.localeCompare(b.date));
}
