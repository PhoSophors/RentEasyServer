// routes/searchRoutes.js

const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// SEARCH ================================================================================================
router.get('/', searchController.search);

module.exports = router;