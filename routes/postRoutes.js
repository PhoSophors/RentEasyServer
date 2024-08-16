const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authMiddleware, checkRoleMiddleware } = require('../middleware/authMiddleware');

// Common middleware for authenticated routes with role checking
const commonMiddleware = [authMiddleware, checkRoleMiddleware(['user', 'admin'])];

// POSTS ================================================================================================
router.post('/create-post', commonMiddleware, postController.createPost);
router.delete('/delete-post/:id', commonMiddleware, postController.deletePost);
router.post('/update-post/:id', commonMiddleware, postController.updatePost);

// GET POSTS ================================================================================================
router.get('/get-all-posts', postController.getAllPosts);
router.get('/get-post/:id', postController.getPostById);
router.get('/get-user-posts', authMiddleware, postController.getPostsByUser);
router.get('/get-posts-by-property-type', postController.getPostsByPropertyType);

module.exports = router;