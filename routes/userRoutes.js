const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.register);
router.post('/register-verify', userController.verifyOTP);
router.post('/login', userController.userLogin);

module.exports = router;