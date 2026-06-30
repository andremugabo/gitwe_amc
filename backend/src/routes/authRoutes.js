const express = require('express');
const router = express.Router();
const { 
  loginUser, 
  registerUser, 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  getUserProfile 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/verify', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getUserProfile);

module.exports = router;
