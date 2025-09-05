
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3();

async function uploadBuffer(buffer, filename, mimeType) {
  const key = `${uuidv4()}_${filename}`;
  await s3.putObject({ Bucket: process.env.S3_BUCKET, Key: key, Body: buffer, ContentType: mimeType }).promise();
  return key;
}

async function getSignedUrl(key) {
  return s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: key, Expires: 60 * 10 });
}

module.exports = { uploadBuffer, getSignedUrl };
