// routes/messageRoutes.js

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authMiddleware, checkRoleMiddleware } = require('../middleware/authMiddleware');

// Common middleware for all routes
const commonMiddleware = [authMiddleware, checkRoleMiddleware(['user', 'admin'])];

// MESSAGES ================================================================================================
router.post('/create', commonMiddleware, messageController.createMessage);
router.post('/delete/:id', commonMiddleware, messageController.deleteMessage);
router.post('/update/:id', commonMiddleware, messageController.updateMessage);

// MARK AS READ MESSAGE ================================================================================================
router.post('/mark-as-read/:id', commonMiddleware, messageController.markMessageAsRead);

// GET MESSAGES ================================================================================================
router.get('/get-all-messages', commonMiddleware, messageController.getAllMessages);

module.exports = router;
