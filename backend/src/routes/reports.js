const express = require('express');
const ExcelJS = require('exceljs');
const { getDB } = require('../db/excelStore');
const { verifyToken } = require('../middleware/auth');
const { computePayroll } = require('../utils/payrollCalc');

const router = express.Router();

function buildRows() {
  const db = getDB();
  return db.employees.map((e) => ({ emp: e, p: computePayroll(e) }));
}

router.get('/summary', verifyToken, (req, res) => {
  const rows = buildRows();
  const totalPayroll = rows.reduce((s, r) => s + r.p.gross, 0);
  const totalDeductions = rows.reduce((s, r) => s + r.p.totalDeductions, 0);
  const totalTax = rows.reduce((s, r) => s + r.p.tax, 0);
  const totalContributions = rows.reduce((s, r) => s + r.p.sss + r.p.philhealth + r.p.pagibig, 0);
  res.json({
    totalEmployees: rows.length,
    totalPayroll: Math.round(totalPayroll * 100) / 100,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    totalContributions: Math.round(totalContributions * 100) / 100,
    averageSalary: rows.length ? Math.round((totalPayroll / rows.length) * 100) / 100 : 0,
  });
});

router.get('/export', verifyToken, async (req, res) => {
  const format = (req.query.format || 'csv').toLowerCase();
  const rows = buildRows();
  const header = ['Employee', 'Department', 'Position', 'Basic', 'Gross', 'SSS', 'PhilHealth', 'Pag-IBIG', 'Tax', 'Net'];
  const dataRows = rows.map(({ emp, p }) => [emp.name, emp.dept, emp.position, emp.basic, p.gross, p.sss, p.philhealth, p.pagibig, p.tax, p.net]);

  if (format === 'xlsx') {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Payroll Report');
    ws.addRow(header);
    ws.getRow(1).font = { bold: true };
    dataRows.forEach((r) => ws.addRow(r));
    ws.columns.forEach((c) => { c.width = 16; });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="payroll-report.xlsx"');
    await wb.xlsx.write(res);
    return res.end();
  }

  const csv = [header.join(','), ...dataRows.map((r) => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="payroll-report.csv"');
  res.send(csv);
});

module.exports = router;
