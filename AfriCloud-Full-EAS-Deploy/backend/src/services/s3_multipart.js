
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3();

async function initiateMultipartUpload(filename, mimeType) {
  const params = { Bucket: process.env.S3_BUCKET, Key: `${uuidv4()}_${filename}`, ContentType: mimeType };
  const res = await s3.createMultipartUpload(params).promise();
  return { uploadId: res.UploadId, key: res.Key };
}

async function getPartPresignedUrl(key, uploadId, partNumber) {
  const params = { Bucket: process.env.S3_BUCKET, Key: key, PartNumber: partNumber, UploadId: uploadId };
  return s3.getSignedUrlPromise('uploadPart', params);
}

async function completeMultipartUpload(key, uploadId, parts) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts.map(p => ({ ETag: p.etag, PartNumber: p.partNumber })) }
  };
  return s3.completeMultipartUpload(params).promise();
}

async function abortMultipartUpload(key, uploadId) {
  return s3.abortMultipartUpload({ Bucket: process.env.S3_BUCKET, Key: key, UploadId: uploadId }).promise();
}

module.exports = { initiateMultipartUpload, getPartPresignedUrl, completeMultipartUpload, abortMultipartUpload };
