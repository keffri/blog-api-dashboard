const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');

// LOGIN
router.get('/log-in', user_controller.getLogin);
router.post('/log-in', user_controller.postLogin);

// LOGOUT
router.get('/log-out', user_controller.getLogout);

module.exports = router;
