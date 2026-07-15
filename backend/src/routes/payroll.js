const express = require('express');
const { getDB, save } = require('../db/excelStore');
const { verifyToken, requireRole } = require('../middleware/auth');
const { computePayroll } = require('../utils/payrollCalc');

const router = express.Router();
const STATUS_ORDER = ['Draft', 'Processing', 'Completed', 'Released'];

router.get('/runs', verifyToken, (req, res) => {
  const db = getDB();
  res.json(db.payrollRuns);
});

router.post('/runs', verifyToken, requireRole('admin', 'employer'), async (req, res) => {
  const { period } = req.body;
  const db = getDB();
  const total = db.employees.reduce((sum, e) => sum + computePayroll(e).gross, 0);
  const id = db.payrollRuns.length ? Math.max(...db.payrollRuns.map((r) => r.id)) + 1 : 1;
  const run = {
    id,
    period: period || new Date().toLocaleString('en-PH', { month: 'long', year: 'numeric' }),
    generated: new Date().toISOString().slice(0, 10),
    status: 'Draft',
    employeeCount: db.employees.length,
    total: Math.round(total * 100) / 100,
  };
  db.payrollRuns.push(run);
  await save();
  res.status(201).json(run);
});

router.patch('/runs/:id/advance', verifyToken, requireRole('admin', 'employer'), async (req, res) => {
  const db = getDB();
  const id = Number(req.params.id);
  const run = db.payrollRuns.find((r) => r.id === id);
  if (!run) return res.status(404).json({ error: 'That payroll run could not be found.' });

  const idx = STATUS_ORDER.indexOf(run.status);
  if (idx === STATUS_ORDER.length - 1) {
    return res.status(400).json({ error: 'This payroll run has already been released.' });
  }
  run.status = STATUS_ORDER[idx + 1];
  await save();
  res.json(run);
});

module.exports = router;
