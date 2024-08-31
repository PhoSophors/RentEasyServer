// routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, checkRoleMiddleware } = require('../middleware/authMiddleware');

// GET ROUTE =========================================================
router.get('/all-users', authMiddleware, checkRoleMiddleware(['admin', 'user']), adminController.getAllUsers);
router.get('/all-posts', authMiddleware, checkRoleMiddleware(['admin']), adminController.getAllPosts);

// DELETE ROUTE =========================================================
router.post('/delete-user/:id', authMiddleware, checkRoleMiddleware(['admin']), adminController.deleteUser);
router.post('/delete-post/:id', authMiddleware, checkRoleMiddleware(['admin']), adminController.deletePost);

// POST ROUTE =========================================================
router.post('/add-sub-admin', authMiddleware, checkRoleMiddleware(['admin']), adminController.addUserToSubAdmin);

module.exports = router;