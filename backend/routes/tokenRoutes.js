const express = require('express');
const router = express.Router();
const {
  generateToken,
  getMyTokens,
  getTokenById,
  cancelToken,
  verifyTokenByQr,
} = require('../controllers/tokenController');
const { protect, authorize } = require('../middleware/auth');

// Protected for logged-in citizens
router.post('/', protect, authorize('citizen', 'admin'), generateToken);
router.get('/my', protect, getMyTokens);
router.get('/verify-qr/:qrToken', protect, authorize('staff', 'admin'), verifyTokenByQr);
router.patch('/:id/cancel', protect, cancelToken);
router.get('/:id', getTokenById);

module.exports = router;
