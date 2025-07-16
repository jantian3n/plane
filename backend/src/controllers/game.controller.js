const User = require('../models/user.model');
const GameProfile = require('../models/gameProfile.model');
const Airport = require('../models/airport.model');
const Aircraft = require('../models/aircraft.model');
const Transaction = require('../models/transaction.model');

// 游戏配置常量
const AIRCRAFT_MODELS = {
  'ARJ21-700': { capacity: 70, price: 2000, maintenanceCost: 100, dailyIncome: 200 },
  'ARJ21-900': { capacity: 90, price: 2800, maintenanceCost: 140, dailyIncome: 300 },
  'C919-A': { capacity: 150, price: 2800, maintenanceCost: 180, dailyIncome: 350 },
  'C919-B': { capacity: 180, price: 3500, maintenanceCost: 220, dailyIncome: 450 },
  'A320': { capacity: 200, price: 3500, maintenanceCost: 250, dailyIncome: 500 },
  'A330': { capacity: 300, price: 4200, maintenanceCost: 320, dailyIncome: 600 },
  'A350': { capacity: 350, price: 5000, maintenanceCost: 380, dailyIncome: 700 }
};

// 初始化用户的游戏资料
exports.initializeGameProfile = async (req, res) => {
  try {
    // 检查用户是否已有游戏资料
    let user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.gameProfile) {
      return res.status(400).json({ message: 'Game profile already exists' });
    }

    // 创建新的游戏资料
    const gameProfile = new GameProfile({
      user: req.userId,
      balance: 10000,
      experience: 0,
      level: 1
    });

    await gameProfile.save();

    // 更新用户记录
    user.gameProfile = gameProfile._id;
    await user.save();

    // 创建初始机场
    const defaultAirport = new Airport({
      owner: req.userId,
      name: `${user.username}'s Airport`,
      level: 1,
      runways: [{ type: 'small', length: 2000 }],
      parkingSpots: [
        { type: 'standard', fee: 100 },
        { type: 'standard', fee: 100 },
        { type: 'standard', fee: 100 },
        { type: 'standard', fee: 100 },
        { type: 'standard', fee: 100 }
      ],
      facilities: [
        { type: 'terminal', level: 1, capacity: 200 }
      ],
      location: { 
        x: Math.floor(Math.random() * 1000), 
        y: Math.floor(Math.random() * 1000) 
      }
    });

    await defaultAirport.save();

    res.status(201).json({
      message: 'Game profile initialized successfully',
      gameProfile,
      airport: defaultAirport
    });
  } catch (error) {
    console.error('Error initializing game profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 获取用户游戏仪表板数据
exports.getDashboard = async (req, res) => {
  try {
    // 获取用户及其游戏资料
    const user = await User.findById(req.userId).populate('gameProfile');
    
    if (!user || !user.gameProfile) {
      return res.status(404).json({ message: 'Game profile not found' });
    }
    
    // 获取用户的机场
    const airports = await Airport.find({ owner: req.userId });
    
    // 获取用户的飞机
    const aircraft = await Aircraft.find({ owner: req.userId });
    
    // 获取最近的交易
    const transactions = await Transaction.find({
      $or: [
        { from: req.userId },
        { to: req.userId }
      ]
    }).sort({ createdAt: -1 }).limit(10)
    .populate('from', 'username')
    .populate('to', 'username')
    .populate('aircraft', 'name model')
    .populate('airport', 'name');
    
    res.status(200).json({
      gameProfile: user.gameProfile,
      airports,
      aircraft,
      transactions
    });
  } catch (error) {
    console.error('Error getting game dashboard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 购买新飞机
exports.purchaseAircraft = async (req, res) => {
  try {
    const { model, name } = req.body;
    
    // 验证飞机型号
    if (!AIRCRAFT_MODELS[model]) {
      return res.status(400).json({ message: 'Invalid aircraft model' });
    }
    
    // 获取用户游戏资料
    const user = await User.findById(req.userId).populate('gameProfile');
    if (!user || !user.gameProfile) {
      return res.status(404).json({ message: 'Game profile not found' });
    }
    
    const gameProfile = await GameProfile.findById(user.gameProfile._id);
    
    // 检查用户资金是否充足
    const aircraftPrice = AIRCRAFT_MODELS[model].price;
    if (gameProfile.balance < aircraftPrice) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }
    
    // 获取用户的机场（用于停放新飞机）
    const userAirport = await Airport.findOne({ owner: req.userId });
    if (!userAirport) {
      return res.status(404).json({ message: 'Airport not found' });
    }
    
    // 创建新飞机记录
    const newAircraft = new Aircraft({
      owner: req.userId,
      model,
      name: name || `${model}-${Math.floor(Math.random() * 1000)}`,
      purchasePrice: aircraftPrice,
      capacity: AIRCRAFT_MODELS[model].capacity,
      maintenanceCost: AIRCRAFT_MODELS[model].maintenanceCost,
      currentLocation: userAirport._id,
      status: 'parked',
      condition: 100
    });
    
    await newAircraft.save();
    
    // 更新用户余额
    gameProfile.balance -= aircraftPrice;
    gameProfile.statistics.aircraftPurchased += 1;
    await gameProfile.save();
    
    // 记录交易
    const transaction = new Transaction({
      type: 'purchase',
      from: req.userId,
      amount: aircraftPrice,
      aircraft: newAircraft._id,
      description: `Purchased ${model} aircraft named "${newAircraft.name}"`
    });
    
    await transaction.save();
    
    res.status(201).json({
      message: 'Aircraft purchased successfully',
      aircraft: newAircraft,
      balance: gameProfile.balance,
      transaction
    });
  } catch (error) {
    console.error('Error purchasing aircraft:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 设置飞机航线
exports.setAircraftRoute = async (req, res) => {
  try {
    const { aircraftId } = req.params;
    const { destinationId, departureTime } = req.body;
    
    // 查找飞机
    const aircraft = await Aircraft.findOne({
      _id: aircraftId,
      owner: req.userId
    });
    
    if (!aircraft) {
      return res.status(404).json({ message: 'Aircraft not found or not owned by user' });
    }
    
    // 检查飞机状态
    if (aircraft.status !== 'parked') {
      return res.status(400).json({ message: 'Aircraft is not available for new route' });
    }
    
    // 查找目的地机场
    const destination = await Airport.findById(destinationId);
    if (!destination) {
      return res.status(404).json({ message: 'Destination airport not found' });
    }
    
    // 查找飞机当前位置
    const source = await Airport.findById(aircraft.currentLocation);
    if (!source) {
      return res.status(404).json({ message: 'Source airport not found' });
    }
    
    // 计算航线距离
    const distance = calculateDistance(
      source.location.x, source.location.y,
      destination.location.x, destination.location.y
    );
    
    // 计算飞行时间（假设每100单位距离需要1小时）
    const flightTimeHours = distance / 100;
    const departureDate = new Date(departureTime);
    const arrivalDate = new Date(departureDate.getTime() + (flightTimeHours * 60 * 60 * 1000));
    
    // 计算收入（基于距离和飞机容量）
    const incomeRate = AIRCRAFT_MODELS[aircraft.model].dailyIncome / 24; // 每小时收入
    const routeIncome = Math.floor(incomeRate * flightTimeHours * (0.8 + Math.random() * 0.4)); // 加入随机因素
    
    // 设置航线
    aircraft.activeRoute = {
      source: source._id,
      destination: destination._id,
      departureTime: departureDate,
      arrivalTime: arrivalDate,
      income: routeIncome,
      routeDistance: distance
    };
    
    aircraft.status = 'in-flight';
    await aircraft.save();
    
    res.status(200).json({
      message: 'Aircraft route set successfully',
      route: aircraft.activeRoute,
      aircraft: {
        id: aircraft._id,
        name: aircraft.name,
        model: aircraft.model,
        status: aircraft.status
      }
    });
  } catch (error) {
    console.error('Error setting aircraft route:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 升级机场
exports.upgradeAirport = async (req, res) => {
  try {
    const { airportId } = req.params;
    const { upgradeType, upgradeSubType, level } = req.body;
    
    // 查找机场
    const airport = await Airport.findOne({
      _id: airportId,
      owner: req.userId
    });
    
    if (!airport) {
      return res.status(404).json({ message: 'Airport not found or not owned by user' });
    }
    
    // 获取用户游戏资料
    const user = await User.findById(req.userId).populate('gameProfile');
    if (!user || !user.gameProfile) {
      return res.status(404).json({ message: 'Game profile not found' });
    }
    
    const gameProfile = await GameProfile.findById(user.gameProfile._id);
    
    // 计算升级费用和应用升级
    let upgradeCost = 0;
    let upgradeDescription = '';
    
    switch(upgradeType) {
      case 'runway':
        // 添加新跑道
        upgradeCost = 5000;
        airport.runways.push({
          type: upgradeSubType || 'small',
          length: upgradeSubType === 'small' ? 2000 : 
                  upgradeSubType === 'medium' ? 3000 : 4000
        });
        upgradeDescription = `Added new ${upgradeSubType} runway`;
        break;
        
      case 'parking':
        // 添加新停机位
        upgradeCost = 1000;
        airport.parkingSpots.push({
          type: upgradeSubType || 'standard',
          fee: upgradeSubType === 'standard' ? 100 : 
               upgradeSubType === 'premium' ? 200 : 300
        });
        upgradeDescription = `Added new ${upgradeSubType} parking spot`;
        break;
        
      case 'facility':
        // 添加或升级设施
        const existingFacility = airport.facilities.find(f => f.type === upgradeSubType);
        
        if (existingFacility) {
          // 升级现有设施
          if (existingFacility.level >= 5) {
            return res.status(400).json({ message: 'Facility already at maximum level' });
          }
          
          upgradeCost = 2000 * existingFacility.level;
          existingFacility.level += 1;
          existingFacility.capacity = existingFacility.capacity * 1.5;
          upgradeDescription = `Upgraded ${upgradeSubType} facility to level ${existingFacility.level}`;
        } else {
          // 添加新设施
          upgradeCost = 3000;
          
          let baseCapacity = 0;
          if (upgradeSubType === 'terminal') baseCapacity = 200;
          else if (upgradeSubType === 'maintenance') baseCapacity = 5;
          else if (upgradeSubType === 'catering') baseCapacity = 100;
          else if (upgradeSubType === 'fuel') baseCapacity = 1000;
          
          airport.facilities.push({
            type: upgradeSubType,
            level: 1,
            capacity: baseCapacity
          });
          
          upgradeDescription = `Added new ${upgradeSubType} facility`;
        }
        break;
        
      case 'airport':
        // 升级整个机场
        upgradeCost = 10000 * airport.level;
        airport.level += 1;
        upgradeDescription = `Upgraded airport to level ${airport.level}`;
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid upgrade type' });
    }
    
    // 检查资金是否充足
    if (gameProfile.balance < upgradeCost) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }
    
    // 更新用户余额
    gameProfile.balance -= upgradeCost;
    await gameProfile.save();
    
    // 保存机场更新
    await airport.save();
    
    // 记录交易
    const transaction = new Transaction({
      type: 'upgrade',
      from: req.userId,
      amount: upgradeCost,
      airport: airport._id,
      description: upgradeDescription
    });
    
    await transaction.save();
    
    res.status(200).json({
      message: 'Airport upgraded successfully',
      airport,
      balance: gameProfile.balance,
      transaction
    });
  } catch (error) {
    console.error('Error upgrading airport:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 获取可供停靠的机场列表
exports.getAvailableAirports = async (req, res) => {
  try {
    // 获取所有非当前用户拥有的机场
    const airports = await Airport.find({ 
      owner: { $ne: req.userId } 
    }).populate('owner', 'username');
    
    // 为每个机场添加额外信息
    const airportsWithDetails = await Promise.all(airports.map(async (airport) => {
      // 计算可用停机位
      const availableSpots = airport.parkingSpots.filter(spot => !spot.occupied).length;
      
      return {
        id: airport._id,
        name: airport.name,
        ownerName: airport.owner.username,
        level: airport.level,
        location: airport.location,
        availableSpots,
        facilities: airport.facilities.map(f => ({
          type: f.type,
          level: f.level
        })),
        parkingFees: {
          standard: airport.parkingSpots.find(s => s.type === 'standard')?.fee || 0,
          premium: airport.parkingSpots.find(s => s.type === 'premium')?.fee || 0,
          exclusive: airport.parkingSpots.find(s => s.type === 'exclusive')?.fee || 0
        }
      };
    }));
    
    res.status(200).json({ airports: airportsWithDetails });
  } catch (error) {
    console.error('Error getting available airports:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 停靠飞机在其他用户机场
exports.parkAircraftAtAirport = async (req, res) => {
  try {
    const { aircraftId, airportId, spotType, duration } = req.body;
    
    // 验证参数
    if (!aircraftId || !airportId || !spotType || !duration) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    if (!['standard', 'premium', 'exclusive'].includes(spotType)) {
      return res.status(400).json({ message: 'Invalid spot type' });
    }
    
    if (duration < 1 || duration > 72) {
      return res.status(400).json({ message: 'Duration must be between 1 and 72 hours' });
    }
    
    // 查找飞机
    const aircraft = await Aircraft.findOne({
      _id: aircraftId,
      owner: req.userId
    });
    
    if (!aircraft) {
      return res.status(404).json({ message: 'Aircraft not found or not owned by user' });
    }
    
    // 检查飞机状态
    if (aircraft.status !== 'parked') {
      return res.status(400).json({ message: 'Aircraft is not available for parking' });
    }
    
    // 查找目标机场
    const airport = await Airport.findById(airportId);
    if (!airport) {
      return res.status(404).json({ message: 'Airport not found' });
    }
    
    // 检查机场是否属于其他用户
    if (airport.owner.toString() === req.userId) {
      return res.status(400).json({ message: 'Cannot park at your own airport' });
    }
    
    // 寻找可用的停机位
    const availableSpotIndex = airport.parkingSpots.findIndex(
      spot => spot.type === spotType && !spot.occupied
    );
    
    if (availableSpotIndex === -1) {
      return res.status(400).json({ message: `No available ${spotType} parking spots` });
    }
    
    // 计算停机费
    const spotFee = airport.parkingSpots[availableSpotIndex].fee;
    const totalFee = spotFee * duration;
    
    // 获取用户游戏资料
    const user = await User.findById(req.userId).populate('gameProfile');
    if (!user || !user.gameProfile) {
      return res.status(404).json({ message: 'Game profile not found' });
    }
    
    const gameProfile = await GameProfile.findById(user.gameProfile._id);
    
    // 检查余额是否足够
    if (gameProfile.balance < totalFee) {
      return res.status(400).json({ message: 'Insufficient funds for parking fee' });
    }
    
    // 更新停机位状态
    const parkingEndTime = new Date();
    parkingEndTime.setHours(parkingEndTime.getHours() + parseInt(duration));
    
    airport.parkingSpots[availableSpotIndex].occupied = true;
    airport.parkingSpots[availableSpotIndex].occupiedBy = aircraft._id;
    airport.parkingSpots[availableSpotIndex].occupiedUntil = parkingEndTime;
    
    await airport.save();
    
    // 更新飞机状态
    aircraft.currentLocation = airport._id;
    aircraft.status = 'parked';
    await aircraft.save();
    
    // 更新用户余额
    gameProfile.balance -= totalFee;
    gameProfile.statistics.aircraftParked += 1;
    await gameProfile.save();
    
    // 更新机场拥有者余额 - 机场主获得固定服务费300元/天
    const airportOwnerProfile = await GameProfile.findOne({ user: airport.owner });
    const serviceFee = 300 * (duration / 24); // 300元/天，按时长比例计算
    airportOwnerProfile.balance += serviceFee;
    airportOwnerProfile.statistics.totalRevenue += serviceFee;
    await airportOwnerProfile.save();
    
    // 计算机主应得的随机分红 - 每天有机会获得100-500元不等的分红
    const dailyDividend = Math.floor(Math.random() * 400) + 100; // 100-500之间的随机数
    const totalDividend = dailyDividend * (duration / 24); // 按时长比例计算
    
    // 更新机主余额
    gameProfile.balance += totalDividend;
    gameProfile.statistics.totalRevenue += totalDividend;
    await gameProfile.save();
    
    // 创建交易记录 - 停机费交易
    const parkingTransaction = new Transaction({
      type: 'parking-fee',
      from: req.userId,
      to: airport.owner,
      amount: serviceFee, // 服务费
      aircraft: aircraft._id,
      airport: airport._id,
      description: `Service fee for parking ${aircraft.name} at ${airport.name} for ${duration} hours`
    });
    
    await parkingTransaction.save();
    
    // 创建交易记录 - 分红交易
    const dividendTransaction = new Transaction({
      type: 'service',
      from: airport.owner,
      to: req.userId,
      amount: totalDividend, // 分红
      aircraft: aircraft._id,
      airport: airport._id,
      description: `Dividend for ${aircraft.name} parked at ${airport.name} (passenger traffic revenue)`
    });
    
    await dividendTransaction.save();
    
    res.status(200).json({
      message: 'Aircraft parked successfully',
      parkingDetails: {
        airport: airport.name,
        spotType,
        serviceFee: serviceFee,
        dividend: totalDividend,
        endTime: parkingEndTime
      },
      balance: gameProfile.balance,
      transactions: [parkingTransaction, dividendTransaction]
    });
  } catch (error) {
    console.error('Error parking aircraft:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 获取排行榜
exports.getLeaderboard = async (req, res) => {
  try {
    // 获取游戏资料排名（按余额）
    const wealthLeaderboard = await GameProfile.find()
      .sort({ balance: -1 })
      .limit(10)
      .populate('user', 'username');
      
    // 获取机场排名（按等级和收入）
    const airportLeaderboard = await Airport.find()
      .sort({ level: -1, 'statistics.totalIncome': -1 })
      .limit(10)
      .populate('owner', 'username');
      
    // 获取飞机拥有数量排名
    const aircraftCountByOwner = await Aircraft.aggregate([
      { $group: { _id: '$owner', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // 获取用户名称
    const userIds = aircraftCountByOwner.map(item => item._id);
    const users = await User.find({ _id: { $in: userIds } }, 'username');
    
    const userMap = {};
    users.forEach(user => {
      userMap[user._id] = user.username;
    });
    
    const fleetLeaderboard = aircraftCountByOwner.map(item => ({
      username: userMap[item._id],
      aircraftCount: item.count
    }));
    
    res.status(200).json({
      wealth: wealthLeaderboard.map(profile => ({
        username: profile.user.username,
        balance: profile.balance,
        level: profile.level
      })),
      airports: airportLeaderboard.map(airport => ({
        airportName: airport.name,
        ownerName: airport.owner.username,
        level: airport.level,
        income: airport.statistics.totalIncome
      })),
      fleets: fleetLeaderboard
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 工具函数：计算两点之间的距离
function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}