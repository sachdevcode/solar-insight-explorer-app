const express = require('express');
const {
  uploadFiles,
  uploadProposal,
  uploadUtilityBill,
} = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { upload, handleUploadErrors } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Protected routes - all upload routes require authentication
router.use(protect);

// Upload both proposal and utility bill files at once
router.post(
  '/',
  upload.fields([
    { name: 'proposalFile', maxCount: 1 },
    { name: 'utilityBillFile', maxCount: 1 },
  ]),
  handleUploadErrors,
  uploadFiles
);

// Upload only a proposal file
router.post(
  '/proposal',
  upload.single('proposalFile'),
  handleUploadErrors,
  uploadProposal
);

// Upload only a utility bill file
router.post(
  '/utility-bill',
  upload.single('utilityBillFile'),
  handleUploadErrors,
  uploadUtilityBill
);

module.exports = router; 