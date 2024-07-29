// config/S3Helper.js

const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// Configure the S3 client
exports.s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

exports.deleteProfileFromS3 = async (key) => {
  const deleteParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  };

  await s3Client.send(new DeleteObjectCommand(deleteParams));
};