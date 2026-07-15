// JERSA ERP — seed.js
// Sample data for "Jersa Trading Co.", a construction & hardware supply
// company — this grounds why the ERP needs HR, Payroll, Inventory, and POS
// all in one place, instead of feeling like an arbitrary demo.

import { todayISO } from './utils.js';

export function buildSeed() {
  const departments = [
    { id: 'dept_wh', name: 'Warehouse & Logistics', head: 'Ramon Aquino', budget: 620000 },
    { id: 'dept_sales', name: 'Retail Sales', head: 'Bea Fernandez', budget: 410000 },
    { id: 'dept_fin', name: 'Finance & Accounting', head: 'Diane Reyes', budget: 260000 },
    { id: 'dept_hr', name: 'Human Resources', head: 'Carlo Mendoza', budget: 190000 },
    { id: 'dept_it', name: 'IT & Systems', head: 'Miguel Torres', budget: 230000 },
    { id: 'dept_admin', name: 'Executive & Admin', head: 'Jeoffrey Sarmiento', budget: 310000 },
  ];

  const employees = [
    emp('emp_001', 'Jeoffrey Sarmiento', 'dept_admin', 'General Manager', 'Full-time', '2019-03-01', 'Active', 65000, { transportation: 3000, meal: 2000, communication: 1500 }, 0, 8000, 'Present', 18),
    emp('emp_002', 'Ramon Aquino', 'dept_wh', 'Warehouse Supervisor', 'Full-time', '2020-06-15', 'Active', 34000, { transportation: 2000, meal: 1500 }, 1200, 0, 'Present', 12),
    emp('emp_003', 'Bea Fernandez', 'dept_sales', 'Sales Manager', 'Full-time', '2021-01-11', 'Active', 38000, { transportation: 2000, meal: 1500, communication: 1000 }, 0, 3500, 'Present', 15),
    emp('emp_004', 'Miguel Torres', 'dept_it', 'IT Support Specialist', 'Full-time', '2022-09-05', 'Active', 32000, { transportation: 1500, meal: 1500, communication: 1000 }, 800, 0, 'Present', 14),
    emp('emp_005', 'Diane Reyes', 'dept_fin', 'Finance Manager', 'Full-time', '2020-02-18', 'Active', 42000, { transportation: 2000, meal: 1500 }, 0, 0, 'Present', 10),
    emp('emp_006', 'Carlo Mendoza', 'dept_hr', 'HR Officer', 'Full-time', '2021-07-20', 'Active', 27000, { transportation: 1500, meal: 1500 }, 0, 0, 'On Leave', 6),
    emp('emp_007', 'Trisha Bautista', 'dept_fin', 'Payroll Officer', 'Full-time', '2021-04-18', 'Active', 29000, { transportation: 1500, meal: 1500 }, 0, 0, 'Present', 11),
    emp('emp_008', 'Noel Ramos', 'dept_wh', 'Inventory Clerk', 'Full-time', '2023-02-13', 'Active', 22000, { transportation: 1200, meal: 1200 }, 600, 0, 'Present', 13),
    emp('emp_009', 'Andrea Villanueva', 'dept_wh', 'Logistics Coordinator', 'Full-time', '2020-11-05', 'Active', 28000, { transportation: 1500, meal: 1500 }, 900, 0, 'Absent', 9),
    emp('emp_010', 'Joshua Del Rosario', 'dept_sales', 'Sales Associate', 'Full-time', '2023-05-22', 'Active', 21000, { transportation: 1200, meal: 1200 }, 0, 1800, 'Present', 15),
    emp('emp_011', 'Ken Aquino', 'dept_sales', 'Sales Associate', 'Contract', '2024-01-09', 'Active', 20000, { transportation: 1000, meal: 1000 }, 0, 0, 'Present', 5),
    emp('emp_012', 'Mikaela Santos', 'dept_hr', 'Recruitment Specialist', 'Full-time', '2022-10-03', 'Active', 25000, { transportation: 1200, meal: 1200 }, 0, 0, 'Late', 12),
    emp('emp_013', 'Rafael Cruz', 'dept_it', 'Systems Developer', 'Full-time', '2023-03-14', 'Active', 36000, { transportation: 1500, meal: 1500, communication: 1000 }, 1500, 0, 'Present', 14),
    emp('emp_014', 'Patricia Lim', 'dept_admin', 'Executive Assistant', 'Part-time', '2024-06-01', 'Active', 16000, { transportation: 800, meal: 800 }, 0, 0, 'Present', 4),
  ];

  const inventory = [
    { id: 'inv_001', name: 'Portland Cement 40kg', sku: 'CEM-040', category: 'Cement & Aggregates', quantity: 820, unitCost: 245, reorderLevel: 150 },
    { id: 'inv_002', name: 'Deformed Steel Bar 10mm', sku: 'RBAR-10', category: 'Steel & Rebar', quantity: 1240, unitCost: 185, reorderLevel: 200 },
    { id: 'inv_003', name: 'CHB Hollow Block 4"', sku: 'CHB-04', category: 'Masonry', quantity: 3600, unitCost: 12.5, reorderLevel: 500 },
    { id: 'inv_004', name: 'PVC Pipe 4" x 10ft', sku: 'PVC-410', category: 'Plumbing', quantity: 340, unitCost: 320, reorderLevel: 80 },
    { id: 'inv_005', name: 'GI Sheet Gauge 26', sku: 'GIS-26', category: 'Roofing', quantity: 210, unitCost: 480, reorderLevel: 60 },
    { id: 'inv_006', name: 'Marine Plywood 4x8 1/2"', sku: 'PLY-812', category: 'Lumber', quantity: 156, unitCost: 890, reorderLevel: 40 },
    { id: 'inv_007', name: 'Electrical Wire THHN #12 (100m)', sku: 'WIR-12', category: 'Electrical', quantity: 95, unitCost: 2650, reorderLevel: 25 },
    { id: 'inv_008', name: 'Latex Paint White 4L', sku: 'PNT-W4', category: 'Paint & Finishes', quantity: 128, unitCost: 620, reorderLevel: 30 },
    { id: 'inv_009', name: 'Common Wire Nail 1kg', sku: 'NAIL-01', category: 'Hardware', quantity: 480, unitCost: 78, reorderLevel: 100 },
    { id: 'inv_010', name: 'Safety Helmet (Hard Hat)', sku: 'PPE-HH1', category: 'Safety & PPE', quantity: 64, unitCost: 340, reorderLevel: 20 },
  ];

  const today = todayISO();
  const salesToday = [
    sale('s1', today, '08:42', 12450, 'POS', 'Bea Fernandez'),
    sale('s2', today, '09:15', 3200, 'POS', 'Joshua Del Rosario'),
    sale('s3', today, '10:03', 28900, 'Online', 'Ken Aquino'),
    sale('s4', today, '11:22', 6750, 'POS', 'Bea Fernandez'),
    sale('s5', today, '13:08', 15600, 'POS', 'Joshua Del Rosario'),
    sale('s6', today, '14:47', 9800, 'Online', 'Ken Aquino'),
    sale('s7', today, '16:10', 4300, 'POS', 'Bea Fernandez'),
  ];

  const announcements = [
    { id: 'ann_1', title: 'Mid-year performance reviews start August 1', body: 'Department heads will schedule 1:1 sessions with each team member over the first two weeks of August. Check your calendar invite.', date: daysAgoISO(2), author: 'Carlo Mendoza, HR' },
    { id: 'ann_2', title: 'New warehouse safety protocol', body: 'Hard hats and safety vests are now mandatory in the warehouse floor at all times, including for visitors. Please coordinate with Ramon for spare gear.', date: daysAgoISO(5), author: 'Ramon Aquino, Warehouse' },
    { id: 'ann_3', title: '13th month pay computation schedule', body: 'Finance will release the 13th month pay computation sheet by the last week of November. Reach out to Trisha for any payroll questions.', date: daysAgoISO(9), author: 'Trisha Bautista, Payroll' },
  ];

  const holidays = buildHolidayList();

  return {
    company: { name: 'Jersa Trading Co.', tagline: 'Construction & Hardware Supply', founded: 2019 },
    departments,
    employees,
    inventory,
    salesToday,
    monthlyRevenue: 1846500,
    announcements,
    holidays,
    demoEmployeeId: 'emp_004',
  };
}

function emp(id, name, dept, position, type, hired, status, basic, allowances, overtime, bonus, todayStatus, leaveBalance) {
  return {
    id, name, dept, position, type, hired, status,
    email: name.toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, '.') + '@jersatrading.ph',
    phone: '0917 ' + (200 + Math.floor(Math.random() * 700)) + ' ' + (1000 + Math.floor(Math.random() * 8999)),
    basic, allowances, overtime, bonus,
    leaveBalance,
    todayAttendance: {
      status: todayStatus,
      timeIn: todayStatus === 'Present' || todayStatus === 'Late' ? (todayStatus === 'Late' ? '09:24 AM' : '08:5' + Math.floor(Math.random() * 9) + ' AM') : null,
      timeOut: null,
    },
  };
}

function sale(id, date, time, amount, channel, cashier) {
  return { id, date, time, amount, channel, cashier };
}

function daysAgoISO(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function buildHolidayList() {
  const year = new Date().getFullYear();
  const raw = [
    ['New Year\u2019s Day', '01-01'], ['EDSA People Power', '02-25'], ['Araw ng Kagitingan', '04-09'],
    ['Labor Day', '05-01'], ['Independence Day', '06-12'], ['Ninoy Aquino Day', '08-21'],
    ['National Heroes Day', '08-25'], ['Bonifacio Day', '11-30'], ['Christmas Day', '12-25'],
    ['Rizal Day', '12-30'], ['New Year\u2019s Eve', '12-31'],
  ];
  const list = [];
  [year, year + 1].forEach((y) => {
    raw.forEach(([name, md]) => list.push({ name, date: `${y}-${md}` }));
  });
  return list.sort((a, b) => a.date.localeCompare(b.date));
}
