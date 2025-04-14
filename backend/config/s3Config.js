const { S3Client } = require('@aws-sdk/client-s3'); // Import v3 S3 Client
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Load .env from root specifically for this module
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
console.log('[s3Config] Root .env loaded.');

// Configure AWS SDK v3 S3 Client
// Credentials and region are automatically picked up from environment variables
// (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION) by default in v3.
const s3Client = new S3Client({
  region: process.env.AWS_REGION, // Explicitly setting region is still good practice
  // No need to explicitly pass credentials if they are in standard env vars
});

// File filter function (remains the same)
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    // Reject file with a specific error message
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.'), false);
  }
};

// Configure multer-s3 storage using the v3 client
const s3Storage = multerS3({
  s3: s3Client, // Pass the v3 client instance
  bucket: process.env.S3_BUCKET_NAME,
  // acl: 'public-read', // REMOVED: Bucket has ACLs disabled, rely on bucket policy for public read
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    // Generate a unique key for the file within a 'rewards' folder
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `rewards/${uniqueSuffix}${extension}`);
  },
});

// --- Configuration for COMPANY LOGO uploads ---
const logoStorage = multerS3({
  s3: s3Client,
  bucket: process.env.S3_BUCKET_NAME,
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    // Generate a unique key for the file within a 'logos' folder
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `logos/${uniqueSuffix}${extension}`); // Use 'logos/' subfolder
  },
});

// Create the multer upload instance for REWARD images
const uploadRewardImage = multer({
  storage: s3Storage, // Use the original storage config for rewards
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB file size limit
  },
});

// Create the multer upload instance for COMPANY LOGOS
const uploadCompanyLogo = multer({
  storage: logoStorage, // Use the new storage config for logos
  fileFilter: fileFilter, // Reuse the same image filter
  limits: {
    fileSize: 1024 * 1024 * 2, // Limit logos to 2 MB (adjust as needed)
  },
});

module.exports = {
  uploadRewardImage, // Export middleware for rewards
  uploadCompanyLogo, // Export the new middleware for company logos
};
