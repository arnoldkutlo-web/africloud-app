
const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const { File, Version, Share } = require('../models');
const { uploadBuffer, getSignedUrl } = require('../services/s3');
const upload = multer();

router.get('/', auth, async (req, res) => {
  const files = await File.findAll({ where: { ownerId: req.user.id, deleted: false }});
  res.json(files);
});

router.post('/upload', auth, upload.single('file'), async (req, res) => {
  const f = req.file;
  if (!f) return res.status(400).json({ error: 'file required' });
  const key = await uploadBuffer(f.buffer, f.originalname, f.mimetype);
  const file = await File.create({ name: f.originalname, type: 'file', size: f.size, parentId: req.body.parentId || null, s3Key: key, ownerId: req.user.id });
  await Version.create({ fileId: file.id, s3Key: key, size: f.size });
  res.json(file);
});

router.get('/download/:id', auth, async (req, res) => {
  const file = await File.findByPk(req.params.id);
  if (!file) return res.status(404).json({ error: 'not found' });
  const url = await getSignedUrl(file.s3Key);
  res.json({ url });
});

router.post('/share/:id', auth, async (req, res) => {
  const file = await File.findByPk(req.params.id);
  if (!file) return res.status(404).json({ error: 'not found' });
  const token = require('crypto').randomBytes(16).toString('hex');
  const expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : null;
  const share = await Share.create({ fileId: file.id, token, expiresAt, permission: req.body.permission || 'view' });
  res.json({ link: `/s/${token}`, share });
});

module.exports = router;
