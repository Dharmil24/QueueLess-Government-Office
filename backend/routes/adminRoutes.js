const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getLiveQueueMonitor,
  createOffice,
  updateOffice,
  deleteOffice,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  createService,
  updateService,
  deleteService,
  getCounters,
  createCounter,
  updateCounter,
  deleteCounter,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getCitizens,
  updateCitizen,
  deleteCitizen,
  updateLiveToken,
  deleteLiveToken,
  clearLiveQueue,
  deleteReportToken,
  getReports,
  getAuditLogs,
  getSystemSettings,
  updateSystemSettings,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// Analytics & Live Monitor
router.get('/analytics', getAnalytics);
router.get('/live-queue', getLiveQueueMonitor);
router.patch('/live-queue/tokens/:id', updateLiveToken);
router.delete('/live-queue/tokens/:id', deleteLiveToken);
router.delete('/live-queue/offices/:officeId/clear', clearLiveQueue);

// Office management
router.post('/offices', createOffice);
router.put('/offices/:id', updateOffice);
router.delete('/offices/:id', deleteOffice);

// Department management
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

// Service management
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

// Counter management
router.get('/counters', getCounters);
router.post('/counters', createCounter);
router.put('/counters/:id', updateCounter);
router.delete('/counters/:id', deleteCounter);

// Staff management
router.get('/staff', getStaff);
router.post('/staff', createStaff);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);

// Citizens management
router.get('/citizens', getCitizens);
router.put('/citizens/:id', updateCitizen);
router.delete('/citizens/:id', deleteCitizen);

// Reports, Audit & Settings
router.get('/reports', getReports);
router.delete('/reports/tokens/:id', deleteReportToken);
router.get('/audit-logs', getAuditLogs);
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

module.exports = router;
