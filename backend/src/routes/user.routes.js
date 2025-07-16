const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get current user profile
router.get('/profile', authMiddleware.verifyToken, userController.getUserProfile);

// Get user by ID (admin only)
router.get('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.getUserById);

// Update user (admin or self)
router.put('/:id', authMiddleware.verifyToken, userController.updateUser);

// Get all users (admin only)
router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.getAllUsers);

// Delete user (admin only)
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.deleteUser);

// Ban/unban user (admin only)
router.put('/:id/status', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.updateUserStatus);

module.exports = router;