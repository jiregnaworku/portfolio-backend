const cloudinary = require('cloudinary').v2;

const cloudinaryEnabled = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

const setupCloudinary = () => {
  if (!cloudinaryEnabled) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
};

const uploadToCloudinary = async (filePath, folder = 'portfolio-projects') => {
  return cloudinary.uploader.upload(filePath, { folder });
};

setupCloudinary();

module.exports = { cloudinaryEnabled, setupCloudinary, uploadToCloudinary };
