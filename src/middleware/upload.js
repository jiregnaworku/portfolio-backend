const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(process.cwd(), 'backend', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
    cb(null, `${Date.now()}-${name}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = { upload };
