
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const s3m = require('../services/s3_multipart');
const { File, Version } = require('../models');

// Initiate upload
router.post('/initiate', auth, async (req, res) => {
  const { filename, mimeType, parentId } = req.body;
  if(!filename) return res.status(400).json({ error: 'filename required' });
  const r = await s3m.initiateMultipartUpload(filename, mimeType || 'application/octet-stream');
  // store a placeholder File row to attach on complete (optional)
  const file = await File.create({ name: filename, type: 'file', size: 0, parentId: parentId || null, s3Key: r.key, ownerId: req.user.id });
  res.json({ uploadId: r.uploadId, key: r.key, fileId: file.id });
});

// Get presigned url for a part
router.get('/presign', auth, async (req, res) => {
  const { key, uploadId, partNumber } = req.query;
  if(!key || !uploadId || !partNumber) return res.status(400).json({ error: 'key, uploadId, partNumber required' });
  const url = await s3m.getPartPresignedUrl(key, uploadId, Number(partNumber));
  res.json({ url });
});

// Complete upload - client should send parts array [{etag, partNumber}, ...] and file size
router.post('/complete', auth, async (req, res) => {
  const { key, uploadId, parts, fileId, size } = req.body;
  if(!key || !uploadId || !parts) return res.status(400).json({ error: 'missing' });
  const result = await s3m.completeMultipartUpload(key, uploadId, parts);
  // update file entry and create version
  if(fileId){
    await File.update({ size: size || 0 }, { where: { id: fileId } });
    await Version.create({ fileId, s3Key: key, size: size || 0 });
  }
  res.json({ result });
});

// Abort
router.post('/abort', auth, async (req, res) => {
  const { key, uploadId } = req.body;
  if(!key || !uploadId) return res.status(400).json({ error: 'missing' });
  await s3m.abortMultipartUpload(key, uploadId);
  res.json({ ok: true });
});

module.exports = router;
