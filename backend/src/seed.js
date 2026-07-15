const bcrypt = require('bcryptjs');

function buildSeedData() {
  const employees = [
    { id: 1, name: 'Mikaela Santos', dept: 'Marketing', position: 'Manager', type: 'Full-time', hired: '2022-01-10', status: 'Active', email: 'mikaela.santos@company.ph', phone: '0917 200 1122', basic: 45000, allowances: { transportation: 2000, meal: 1500, communication: 1000, housing: 0 }, overtime: 0, bonus: 3000 },
    { id: 2, name: 'Rafael Cruz', dept: 'Engineering', position: 'Developer', type: 'Full-time', hired: '2023-03-14', status: 'Active', email: 'rafael.cruz@company.ph', phone: '0917 200 1123', basic: 38000, allowances: { transportation: 2000, meal: 1500, communication: 1000, housing: 0 }, overtime: 1800, bonus: 0 },
    { id: 3, name: 'Diane Reyes', dept: 'Finance', position: 'Accountant', type: 'Full-time', hired: '2021-07-01', status: 'Active', email: 'diane.reyes@company.ph', phone: '0917 200 1124', basic: 32000, allowances: { transportation: 1500, meal: 1500, communication: 500, housing: 0 }, overtime: 0, bonus: 0 },
    { id: 4, name: 'Joshua Del Rosario', dept: 'Sales', position: 'Executive', type: 'Full-time', hired: '2024-02-19', status: 'Active', email: 'joshua.delrosario@company.ph', phone: '0917 200 1125', basic: 28000, allowances: { transportation: 2000, meal: 1500, communication: 500, housing: 0 }, overtime: 0, bonus: 4200 },
    { id: 5, name: 'Andrea Villanueva', dept: 'Operations', position: 'Supervisor', type: 'Full-time', hired: '2020-11-05', status: 'Active', email: 'andrea.villanueva@company.ph', phone: '0917 200 1126', basic: 30000, allowances: { transportation: 1500, meal: 1500, communication: 500, housing: 0 }, overtime: 900, bonus: 0 },
    { id: 6, name: 'Carlo Mendoza', dept: 'HR', position: 'HR Officer', type: 'Full-time', hired: '2022-09-12', status: 'Active', email: 'carlo.mendoza@company.ph', phone: '0917 200 1127', basic: 27000, allowances: { transportation: 1500, meal: 1500, communication: 500, housing: 0 }, overtime: 0, bonus: 0 },
    { id: 7, name: 'Bea Fernandez', dept: 'Marketing', position: 'Content Strategist', type: 'Part-time', hired: '2024-06-01', status: 'Active', email: 'bea.fernandez@company.ph', phone: '0917 200 1128', basic: 18000, allowances: { transportation: 800, meal: 800, communication: 0, housing: 0 }, overtime: 0, bonus: 0 },
    { id: 8, name: 'Noel Ramos', dept: 'Engineering', position: 'QA Engineer', type: 'Full-time', hired: '2023-10-23', status: 'On Leave', email: 'noel.ramos@company.ph', phone: '0917 200 1129', basic: 33000, allowances: { transportation: 2000, meal: 1500, communication: 1000, housing: 0 }, overtime: 0, bonus: 0 },
    { id: 9, name: 'Trisha Bautista', dept: 'Finance', position: 'Payroll Officer', type: 'Full-time', hired: '2021-04-18', status: 'Active', email: 'trisha.bautista@company.ph', phone: '0917 200 1130', basic: 31000, allowances: { transportation: 1500, meal: 1500, communication: 500, housing: 0 }, overtime: 0, bonus: 0 },
    { id: 10, name: 'Ken Aquino', dept: 'Sales', position: 'Account Manager', type: 'Contract', hired: '2024-08-02', status: 'Active', email: 'ken.aquino@company.ph', phone: '0917 200 1131', basic: 26000, allowances: { transportation: 1500, meal: 1000, communication: 500, housing: 0 }, overtime: 0, bonus: 2600 },
  ];

  const departments = [
    { id: 1, name: 'Marketing', head: 'Mikaela Santos', budget: 320000, description: 'Brand, growth, and campaigns.' },
    { id: 2, name: 'Engineering', head: 'Rafael Cruz', budget: 540000, description: 'Product and platform development.' },
    { id: 3, name: 'Finance', head: 'Diane Reyes', budget: 210000, description: 'Accounting, treasury, and payroll.' },
    { id: 4, name: 'Sales', head: 'Joshua Del Rosario', budget: 280000, description: 'Revenue and client accounts.' },
    { id: 5, name: 'Operations', head: 'Andrea Villanueva', budget: 190000, description: 'Logistics and facilities.' },
    { id: 6, name: 'HR', head: 'Carlo Mendoza', budget: 150000, description: 'People, hiring, and compliance.' },
  ];

  const grossTotal = employees.reduce((sum, e) => {
    const allowanceTotal = Object.values(e.allowances).reduce((a, b) => a + b, 0);
    return sum + e.basic + allowanceTotal + e.overtime + e.bonus;
  }, 0);

  const payrollRuns = [
    { id: 1, period: 'June 2026', generated: '2026-06-28', status: 'Released', employeeCount: employees.length, total: Math.round(grossTotal * 0.97) },
    { id: 2, period: 'July 2026', generated: '2026-07-28', status: 'Draft', employeeCount: employees.length, total: Math.round(grossTotal) },
  ];

  const users = [
    {
      id: 1,
      name: 'Jeoffrey Sarmiento',
      email: 'admin@sahod.ph',
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: 'admin',
    },
    {
      id: 2,
      name: 'Carlo Mendoza',
      email: 'employer@sahod.ph',
      passwordHash: bcrypt.hashSync('employer123', 10),
      role: 'employer',
    },
  ];

  return { users, employees, departments, payrollRuns };
}

// Allow running directly: `npm run seed` (add --reset to force overwrite)
if (require.main === module) {
  const path = require('path');
  const fs = require('fs');
  require('dotenv').config();
  const filePath = path.resolve(__dirname, '../', process.env.DATA_FILE || './data/payroll.xlsx');
  const reset = process.argv.includes('--reset');
  if (fs.existsSync(filePath) && !reset) {
    console.log('payroll.xlsx already exists. Run with --reset to overwrite it.');
    process.exit(0);
  }
  if (reset && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  (async () => {
    const excelStore = require('./db/excelStore'); // lazy require avoids a load-time circular require
    await excelStore.init(); // file is absent, so this seeds and writes it
    console.log('Seed complete:', excelStore.FILE_PATH);
  })();
}

module.exports = { buildSeedData };
