const express = require('express');
const { getDB, save } = require('../db/excelStore');
const { verifyToken, requireRole } = require('../middleware/auth');
const { computePayroll } = require('../utils/payrollCalc');

const router = express.Router();

router.get('/', verifyToken, (req, res) => {
  const db = getDB();
  const withPayroll = db.employees.map((e) => ({ ...e, payroll: computePayroll(e) }));
  res.json(withPayroll);
});

router.get('/:id', verifyToken, (req, res) => {
  const db = getDB();
  const emp = db.employees.find((e) => e.id === Number(req.params.id));
  if (!emp) return res.status(404).json({ error: 'That employee could not be found.' });
  res.json({ ...emp, payroll: computePayroll(emp) });
});

router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  const { name, dept, position, type, hired, status, email, phone, basic } = req.body;
  if (!name || !position || !basic) {
    return res.status(400).json({ error: 'Name, position, and basic salary are required.' });
  }
  const db = getDB();
  const id = db.employees.length ? Math.max(...db.employees.map((e) => e.id)) + 1 : 1;
  const emp = {
    id,
    name,
    dept: dept || 'Unassigned',
    position,
    type: type || 'Full-time',
    hired: hired || new Date().toISOString().slice(0, 10),
    status: status || 'Active',
    email: email || '',
    phone: phone || '',
    basic: Number(basic),
    allowances: { transportation: 1500, meal: 1200, communication: 500, housing: 0 },
    overtime: 0,
    bonus: 0,
  };
  db.employees.push(emp);
  await save();
  res.status(201).json({ ...emp, payroll: computePayroll(emp) });
});

router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const db = getDB();
  const id = Number(req.params.id);
  const idx = db.employees.findIndex((e) => e.id === id);
  if (idx === -1) return res.status(404).json({ error: 'That employee could not be found.' });

  const allowed = ['name', 'dept', 'position', 'type', 'hired', 'status', 'email', 'phone', 'basic', 'overtime', 'bonus', 'allowances'];
  const updates = {};
  allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });
  if (updates.basic !== undefined) updates.basic = Number(updates.basic);

  db.employees[idx] = { ...db.employees[idx], ...updates };
  await save();
  res.json({ ...db.employees[idx], payroll: computePayroll(db.employees[idx]) });
});

router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const db = getDB();
  const id = Number(req.params.id);
  const exists = db.employees.some((e) => e.id === id);
  if (!exists) return res.status(404).json({ error: 'That employee could not be found.' });
  db.employees = db.employees.filter((e) => e.id !== id);
  await save();
  res.status(204).end();
});

module.exports = router;
