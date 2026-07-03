const multer = require('multer');
const path = require('path');
const fs = require('fs');

const os = require('os');

// Ensure uploads directories exist for local fallback
const isVercel = !!process.env.VERCEL;
const uploadsDir = isVercel ? path.join(os.tmpdir(), 'uploads') : path.join(__dirname, '../uploads');
const resumesDir = path.join(uploadsDir, 'resumes');
const logosDir = path.join(uploadsDir, 'logos');

try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(resumesDir)) fs.mkdirSync(resumesDir, { recursive: true });
  if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir, { recursive: true });
} catch (err) {
  console.warn('Unable to create local upload directories (likely running in a read-only serverless environment):', err.message);
}

// Local storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'resume') {
      cb(null, resumesDir);
    } else {
      cb(null, logosDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File validation
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'resume') {
    // Only PDF allowed for resumes
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf') {
      return cb(new Error('Only PDF resumes are allowed!'), false);
    }
  } else if (file.fieldname === 'logo' || file.fieldname === 'photo') {
    // Images allowed for logos and profiles
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.webp') {
      return cb(new Error('Only PNG, JPG, JPEG, or WEBP images are allowed!'), false);
    }
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  }
});

module.exports = upload;
