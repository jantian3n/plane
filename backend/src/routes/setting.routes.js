const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get all settings (admin only)
router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, settingController.getAllSettings);

// Get setting by key
router.get('/:key', authMiddleware.verifyToken, authMiddleware.isAdmin, settingController.getSettingByKey);

// Update setting (admin only)
router.put('/:key', authMiddleware.verifyToken, authMiddleware.isAdmin, settingController.updateSetting);

module.exports = router;