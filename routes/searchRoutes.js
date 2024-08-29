// routes/searchRoutes.js

const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// SEARCH ================================================================================================
router.get('/searchsPostAndUser', searchController.search);

module.exports = router;