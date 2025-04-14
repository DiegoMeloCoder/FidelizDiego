'use strict';

// Controller function to handle successful image uploads
const handleRewardImageUpload = (req, res) => {
  // Multer-S3 adds the 'location' property to req.file upon successful upload
  if (!req.file || !req.file.location) {
    // This case should ideally be caught by multer's error handling,
    // but added as a safeguard.
    console.error('Upload controller reached without file location.');
    return res.status(400).json({ message: 'File upload failed or file location is missing.' });
  }

  // Return the public URL of the uploaded image
  res.status(200).json({
    message: 'Image uploaded successfully.',
    imageUrl: req.file.location, // The URL provided by S3
  });
};

module.exports = {
  handleRewardImageUpload,
};
