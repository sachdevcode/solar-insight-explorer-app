const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { logger } = require('./errorMiddleware');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define subdirectories for each file type
    const fileType = file.fieldname === 'proposalFile' ? 'proposals' : 'utilityBills';
    const dir = path.join(uploadsDir, fileType);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  // Check if file is PDF for proposal
  if (file.fieldname === 'proposalFile') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Proposal file must be a PDF'), false);
    }
  } 
  // Check if file is PDF or image for utility bill
  else if (file.fieldname === 'utilityBillFile') {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Utility bill file must be a PDF or image (JPEG, PNG)'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
});

// Handle file upload errors
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    } else {
      logger.error(`Multer error: ${err.message}`);
      res.status(400).json({ message: `Upload error: ${err.message}` });
    }
  } else if (err) {
    // Other errors
    logger.error(`File upload error: ${err.message}`);
    res.status(400).json({ message: err.message });
  } else {
    next();
  }
};

module.exports = { upload, handleUploadErrors }; 