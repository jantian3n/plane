const express = require('express');
const mongoose = require('mongoose'); // 添加这行导入语句
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cron = require('node-cron');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const settingRoutes = require('./routes/setting.routes');
const gameRoutes = require('./routes/game.routes');

// Controllers
const settingController = require('./controllers/setting.controller');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/web-game';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware in development mode
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/game', gameRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Web Game API is running');
});

// Connect to MongoDB and initialize settings
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Initialize system settings
    await settingController.initSettings();
    
    // 设置定时任务，每小时检查一次停机位状态
    cron.schedule('0 * * * *', async () => {
      try {
        const Airport = require('./models/airport.model');
        const Aircraft = require('./models/aircraft.model');
        
        console.log('Running scheduled task: checking parking spots status');
        
        // 查找所有机场
        const airports = await Airport.find({});
        
        const now = new Date();
        let updatedCount = 0;
        
        // 检查每个机场的停机位
        for (const airport of airports) {
          let airportUpdated = false;
          
          // 检查每个停机位
          for (const spot of airport.parkingSpots) {
            // 如果停机位被占用且占用时间已过期
            if (spot.occupied && spot.occupiedUntil && spot.occupiedUntil < now) {
              // 更新飞机状态
              if (spot.occupiedBy) {
                await Aircraft.updateOne(
                  { _id: spot.occupiedBy },
                  { 
                    $set: { 
                      status: 'parked',
                      currentLocation: null // 飞机返回到没有特定位置的状态
                    } 
                  }
                );
              }
              
              // 清空停机位
              spot.occupied = false;
              spot.occupiedBy = null;
              spot.occupiedUntil = null;
              airportUpdated = true;
              updatedCount++;
            }
          }
          
          // 如果机场有更新，保存更改
          if (airportUpdated) {
            await airport.save();
          }
        }
        
        console.log(`Task completed: ${updatedCount} parking spots updated`);
      } catch (error) {
        console.error('Error in scheduled task:', error);
      }
    });
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});