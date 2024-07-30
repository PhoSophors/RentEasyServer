// config/S3Helper.js

const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer configuration for handling file uploads
exports.upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    key: function (req, file, cb) {
      const fileExtension = file.mimetype.split("/")[1];
      const uniqueKey = `${Date.now().toString()}.${fileExtension}`;
      cb(null, uniqueKey);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
  }),
});

// Function to delete file from S3
exports.deleteFileFromS3 = async (key) => {
  const deleteParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  };

  await s3Client.send(new DeleteObjectCommand(deleteParams));
};


// Export the S3 client
exports.s3Client = s3Client;
