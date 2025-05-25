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
    cb(
      new Error(
        'Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.'
      ),
      false
    );
  }
};

// Factory Function para crear configuraciones de almacenamiento
/* enfoque es más DRY. Si necesitas subir avatares de usuario, solo tienes que añadir createS3Storage('avatars'). */
const createS3Storage = (folderName) => {
  return multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = path.extname(file.originalname);
      cb(null, `${folderName}/${uniqueSuffix}${extension}`);
    },
  });
};

// Usar la factory para crear las instancias de multer
const uploadRewardImage = multer({
  storage: createS3Storage('rewards'),
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB
});

const uploadCompanyLogo = multer({
  storage: createS3Storage('logos'),
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 2 }, // 2 MB
});

module.exports = {
  uploadRewardImage, // Export middleware for rewards
  uploadCompanyLogo, // Export the new middleware for company logos
};
