const express = require('express');
const router = express.Router();
const { register, demoRegister, demoLogin, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/demo-register', demoRegister);
router.post('/demo-login', demoLogin);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
