// routes/messageRoutes.js

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authMiddleware, checkRoleMiddleware } = require('../middleware/authMiddleware');

// MESSAGES ================================================================================================
router.post('/create', authMiddleware, checkRoleMiddleware(['user', 'admin']), messageController.createMessage);
router.post('/delete/:id', authMiddleware, checkRoleMiddleware(['user', 'admin']), messageController.deleteMessage);
router.post('/update/:id', authMiddleware, checkRoleMiddleware(['user', 'admin']), messageController.updateMessage);

// MARK AS READ MESSAGE ================================================================================================
router.post('/mark-as-read/:id', authMiddleware, checkRoleMiddleware(['user', 'admin']), messageController.markMessageAsRead);

// GET MESSAGES ================================================================================================
router.get('/get-all-messages', authMiddleware, checkRoleMiddleware(['user', 'admin']), messageController.getAllMessages);

module.exports = router;
