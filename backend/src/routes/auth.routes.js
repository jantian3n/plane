const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const registrationMiddleware = require('../middleware/registration.middleware');

// User registration with registration check
router.post('/register', registrationMiddleware.checkRegistrationAllowed, authController.register);

// User login
router.post('/login', authController.login);

module.exports = router;