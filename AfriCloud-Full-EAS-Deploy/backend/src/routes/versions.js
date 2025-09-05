
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { File, Version } = require('../models');
const { getSignedUrl } = require('../services/s3');

router.get('/:fileId', auth, async (req, res) => {
  const versions = await Version.findAll({ where: { fileId: req.params.fileId }, order: [['createdAt','DESC']] });
  res.json(versions);
});

router.post('/restore/:versionId', auth, async (req, res) => {
  const version = await Version.findByPk(req.params.versionId);
  if(!version) return res.status(404).json({ error: 'not found' });
  const file = await File.findByPk(version.fileId);
  if(!file) return res.status(404).json({ error: 'file not found' });
  // Update file's s3Key to version's s3Key (effectively restoring)
  await File.update({ s3Key: version.s3Key, size: version.size }, { where: { id: file.id } });
  res.json({ ok: true });
});

module.exports = router;
