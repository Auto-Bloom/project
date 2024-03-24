const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard'); // Import the updated controller

// Route for the main dashboard view
router.get('/', dashboardController.get);



module.exports = router;
