const express = require('express');
const { getDB, save } = require('../db/excelStore');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, (req, res) => {
  const db = getDB();
  const withCounts = db.departments.map((d) => ({
    ...d,
    employeeCount: db.employees.filter((e) => e.dept === d.name).length,
  }));
  res.json(withCounts);
});

router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  const { name, head, budget, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Department name is required.' });
  const db = getDB();
  const id = db.departments.length ? Math.max(...db.departments.map((d) => d.id)) + 1 : 1;
  const dept = { id, name, head: head || '', budget: Number(budget) || 0, description: description || '' };
  db.departments.push(dept);
  await save();
  res.status(201).json(dept);
});

router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const db = getDB();
  const id = Number(req.params.id);
  const idx = db.departments.findIndex((d) => d.id === id);
  if (idx === -1) return res.status(404).json({ error: 'That department could not be found.' });
  const { name, head, budget, description } = req.body;
  db.departments[idx] = {
    ...db.departments[idx],
    ...(name !== undefined && { name }),
    ...(head !== undefined && { head }),
    ...(budget !== undefined && { budget: Number(budget) }),
    ...(description !== undefined && { description }),
  };
  await save();
  res.json(db.departments[idx]);
});

router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const db = getDB();
  const id = Number(req.params.id);
  db.departments = db.departments.filter((d) => d.id !== id);
  await save();
  res.status(204).end();
});

module.exports = router;
