
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email/password required' });
  const existing = await User.findOne({ where: { email }});
  if (existing) return res.status(400).json({ error: 'already exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash: hash, name });
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name }});
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email }});
  if (!user) return res.status(400).json({ error: 'invalid' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'invalid' });
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name }});
});

module.exports = router;
