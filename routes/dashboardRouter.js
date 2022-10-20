const express = require('express');
const router = express.Router();

const dashboard_controller = require('../controllers/dashboardController');

// DASHBOARD
router.get('/', dashboard_controller.getDashboard);

module.exports = router;
