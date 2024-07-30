const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const  { authMiddleware, checkRoleMiddleware } = require('../middleware/authMiddleware');

// POSTS ================================================================================================
router.post('/create-post', authMiddleware, checkRoleMiddleware(['user', 'admin']), postController.createPost);
router.delete('/delete-post/:id', authMiddleware, checkRoleMiddleware(['user', 'admin']), postController.deletePost);
router.post('/update-post/:id', authMiddleware, checkRoleMiddleware(['user', 'admin']), postController.updatePost);

// GET POSTS ================================================================================================
router.get('/get-all-posts', postController.getAllPosts);
router.get('/get-post/:id', postController.getPostById);
router.get('/get-user-posts', authMiddleware, postController.getPostsByUser);

module.exports = router;