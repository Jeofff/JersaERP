const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB, save } = require('../db/excelStore');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are both required.' });

  const db = getDB();
  const user = db.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) return res.status(401).json({ error: 'Email or password is incorrect.' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'Email or password is incorrect.' });

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'sahod_dev_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// Admin-only: manage employer / admin accounts
router.get('/users', verifyToken, requireRole('admin'), (req, res) => {
  const db = getDB();
  res.json(db.users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
});

router.post('/users', verifyToken, requireRole('admin'), async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are all required.' });
  }
  if (!['admin', 'employer'].includes(role)) {
    return res.status(400).json({ error: 'Role must be either "admin" or "employer".' });
  }
  const db = getDB();
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }
  const id = db.users.length ? Math.max(...db.users.map((u) => u.id)) + 1 : 1;
  const passwordHash = await bcrypt.hash(password, 10);
  db.users.push({ id, name, email, passwordHash, role });
  await save();
  res.status(201).json({ id, name, email, role });
});

router.delete('/users/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const db = getDB();
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account.' });
  db.users = db.users.filter((u) => u.id !== id);
  await save();
  res.status(204).end();
});

module.exports = router;
