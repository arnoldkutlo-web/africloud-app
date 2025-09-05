
const express = require('express');
const router = express.Router();
const { Share, File } = require('../models');
const auth = require('../middleware/auth');
const { getSignedUrl } = require('../services/s3');

// Create share
router.post('/create/:fileId', auth, async (req, res) => {
  const { expiresInSeconds, permission } = req.body;
  const file = await File.findByPk(req.params.fileId);
  if(!file) return res.status(404).json({ error: 'file not found' });
  const token = require('crypto').randomBytes(20).toString('hex');
  const expiresAt = expiresInSeconds ? new Date(Date.now() + Number(expiresInSeconds)*1000) : null;
  const share = await Share.create({ fileId: file.id, token, expiresAt, permission: permission || 'view' });
  res.json({ link: `/s/${token}`, share });
});

// Public download via token
router.get('/s/:token', async (req, res) => {
  const share = await Share.findOne({ where: { token: req.params.token } });
  if(!share) return res.status(404).json({ error: 'not found' });
  if(share.expiresAt && new Date() > new Date(share.expiresAt)) return res.status(410).json({ error: 'expired' });
  const file = await File.findByPk(share.fileId);
  const url = await getSignedUrl(file.s3Key);
  res.json({ url, permission: share.permission });
});

module.exports = router;
