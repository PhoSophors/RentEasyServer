// routes/favoritesRoutes.js

const express = require("express");
const router = express.Router();
const favoritesController = require("../controllers/favoritesController");
const { authMiddleware, checkRoleMiddleware } = require("../middleware/authMiddleware");

// ADD AND REMOVE FAVORITES ======================================================================================
router.post("/add-favorite/:postId", authMiddleware, checkRoleMiddleware(['user', 'admin']), favoritesController.addFavorite);
router.post('/remove-favorite/:postId', authMiddleware, checkRoleMiddleware(['user', 'admin']),  favoritesController.removeFavorite);

// GET FAVORITES =================================================================================================
router.get('/get-favorites', authMiddleware, checkRoleMiddleware(['user', 'admin']), favoritesController.getAllFavoritesByUserAdd);

module.exports = router;