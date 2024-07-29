const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Register user
router.post('/register', userController.register);
router.post('/register-verify', userController.verifyOTP);
router.post('/login', userController.userLogin);

// forgot password 
router.post('/request-reset-password', userController.requestResetPassword);
router.post('/verify-reset-password-otp', userController.verifyResetPasswordOTP);
router.post('/set-new-password', userController.setNewPassword);

// Refresh token
router.post('/refresh-token', userController.refreshToken);

module.exports = router;