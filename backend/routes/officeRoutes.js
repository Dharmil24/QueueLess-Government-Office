const express = require('express');
const router = express.Router();
const { getOffices, getOfficeById, getOfficeQueueSummary } = require('../controllers/officeController');

router.get('/', getOffices);
router.get('/:id', getOfficeById);
router.get('/:id/queue-summary', getOfficeQueueSummary);

module.exports = router;
