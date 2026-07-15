const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { buildSeedData } = require('../seed');

const FILE_PATH = path.resolve(__dirname, '../../', process.env.DATA_FILE || './data/payroll.xlsx');

const SHEETS = {
  users: ['id', 'name', 'email', 'passwordHash', 'role'],
  employees: ['id', 'name', 'dept', 'position', 'type', 'hired', 'status', 'email', 'phone', 'basic', 'allowances', 'overtime', 'bonus'],
  departments: ['id', 'name', 'head', 'budget', 'description'],
  payrollRuns: ['id', 'period', 'generated', 'status', 'employeeCount', 'total'],
};

let DB = null;

function serializeRow(sheetName, headers, row) {
  return headers.map((h) => {
    const v = row[h];
    if (sheetName === 'employees' && h === 'allowances') return JSON.stringify(v || {});
    return v === undefined || v === null ? '' : v;
  });
}

function deserializeRow(sheetName, headers, values) {
  const obj = {};
  headers.forEach((h, i) => {
    let v = values[i + 1]; // exceljs row.values is 1-indexed
    if (sheetName === 'employees' && h === 'allowances') {
      try { v = JSON.parse(v || '{}'); } catch (e) { v = {}; }
    } else if (['id', 'basic', 'overtime', 'bonus', 'budget', 'employeeCount', 'total'].includes(h)) {
      v = v === '' || v === undefined || v === null ? 0 : Number(v);
    }
    obj[h] = v;
  });
  return obj;
}

async function save() {
  if (!DB) throw new Error('Database not initialized.');
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Sahod Payroll System';
  wb.created = new Date();

  Object.entries(SHEETS).forEach(([sheetName, headers]) => {
    const ws = wb.addWorksheet(sheetName);
    ws.addRow(headers);
    ws.getRow(1).font = { bold: true };
    (DB[sheetName] || []).forEach((row) => {
      ws.addRow(serializeRow(sheetName, headers, row));
    });
    ws.columns.forEach((col) => { col.width = 18; });
  });

  fs.mkdirSync(path.dirname(FILE_PATH), { recursive: true });
  await wb.xlsx.writeFile(FILE_PATH);
}

async function load() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(FILE_PATH);

  const result = {};
  Object.entries(SHEETS).forEach(([sheetName, headers]) => {
    const ws = wb.getWorksheet(sheetName);
    const rows = [];
    if (ws) {
      ws.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // header row
        rows.push(deserializeRow(sheetName, headers, row.values));
      });
    }
    result[sheetName] = rows;
  });
  DB = result;
  return DB;
}

async function init() {
  if (!fs.existsSync(FILE_PATH)) {
    console.log('No data file found — seeding a fresh payroll.xlsx with demo data.');
    DB = buildSeedData();
    await save();
  } else {
    await load();
  }
  return DB;
}

function getDB() {
  if (!DB) throw new Error('Database not initialized. Call init() on server start.');
  return DB;
}

module.exports = { init, load, save, getDB, FILE_PATH };
