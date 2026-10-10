const express = require('express');
const router = express.Router();
const {
  getStaffQueue,
  callNextToken,
  recallToken,
  startService,
  completeService,
  skipToken,
} = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('staff', 'admin'));

router.get('/queue', getStaffQueue);
router.post('/token/next', callNextToken);
router.post('/token/:id/recall', recallToken);
router.post('/token/:id/start', startService);
router.post('/token/:id/complete', completeService);
router.post('/token/:id/skip', skipToken);

module.exports = router;
