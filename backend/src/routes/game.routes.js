const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');
const authMiddleware = require('../middleware/auth.middleware');

// 所有游戏路由需要验证令牌
router.use(authMiddleware.verifyToken);

// 初始化游戏资料
router.post('/initialize', gameController.initializeGameProfile);

// 获取游戏仪表板数据
router.get('/dashboard', gameController.getDashboard);

// 购买飞机
router.post('/aircraft/purchase', gameController.purchaseAircraft);

// 设置飞机航线
router.post('/aircraft/:aircraftId/route', gameController.setAircraftRoute);

// 升级机场
router.post('/airport/:airportId/upgrade', gameController.upgradeAirport);

// 获取可用机场列表
router.get('/airports/available', gameController.getAvailableAirports);

// 停靠飞机
router.post('/aircraft/park', gameController.parkAircraftAtAirport);

// 获取排行榜
router.get('/leaderboard', gameController.getLeaderboard);

module.exports = router;