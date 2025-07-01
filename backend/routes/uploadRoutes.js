'use strict';

const express = require('express');
const multer = require('multer'); // Import multer itself for error handling
const uploadController = require('../controllers/uploadController');
// Import BOTH upload middlewares
const { uploadRewardImage, uploadCompanyLogo } = require('../config/s3Config');
const { authenticate, authorize } = require('../middleware/auth'); // Import auth middleware

const router = express.Router();

// Route for uploading reward images
// POST /api/v1/uploads/images/rewards
router.post(
  '/images/rewards',
  authenticate, // 1. Check if user is logged in (valid Firebase token)
  authorize(['Admin']), // 2. Check if user has 'Admin' role (MATCH CASE FROM DB)
  uploadRewardImage.single('rewardImage'), // 3. Handle the file upload using multer-s3. Expects field name 'rewardImage'
  uploadController.handleUploadSuccess // 4. If upload successful, controller sends back the URL
);

// Route for uploading company logos
// POST /api/v1/uploads/images/logos
router.post(
  '/images/logos',
  authenticate,       // 1. Check login
  authorize(['Manager']), // 2. Check role is 'Manager'
  uploadCompanyLogo.single('companyLogo'), // 3. Handle upload using logo middleware. Expects field 'companyLogo'
  // Reuse the same controller function as it just returns the URL
  uploadController.handleUploadSuccess // 4. Controller sends back the URL
);

// Route for uploading GLOBAL reward images (Manager only)
// POST /api/v1/uploads/images/rewards/global
router.post(
  '/images/rewards/global',
  authenticate,       // 1. Check login
  authorize(['Manager']), // 2. Check role is 'Manager'
  // Reuse the reward image upload config, as it saves to the correct folder ('rewards/')
  uploadRewardImage.single('rewardImage'), // 3. Handle upload. Expects field 'rewardImage'
  // Reuse the same controller function
  uploadController.handleUploadSuccess // 4. Controller sends back the URL
);


// Add a basic error handler for multer errors (like file size limit or type)
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    // A Multer error occurred when uploading.
    console.error('Multer error:', error);
    return res.status(400).json({ message: `File upload error: ${error.message}` });
  } else if (error) {
    // An unknown error occurred when uploading (e.g., file type filter).
    console.error('Upload error:', error);
    return res.status(400).json({ message: error.message || 'An unexpected error occurred during file upload.' });
  }
  // Everything went fine, proceed.
  next();
});


module.exports = router;
