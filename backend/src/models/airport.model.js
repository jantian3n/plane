const mongoose = require('mongoose');

const parkingSpotSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['standard', 'premium', 'exclusive'],
    default: 'standard'
  },
  fee: {
    type: Number,
    required: true
  },
  occupied: {
    type: Boolean,
    default: false
  },
  occupiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Aircraft',
    default: null
  },
  occupiedUntil: {
    type: Date,
    default: null
  }
});

const facilitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['terminal', 'maintenance', 'catering', 'fuel'],
    required: true
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  capacity: {
    type: Number,
    required: true
  }
});

const runwaySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'small'
  },
  length: {
    type: Number,
    required: true
  }
});

const airportSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  runways: [runwaySchema],
  parkingSpots: [parkingSpotSchema],
  facilities: [facilitySchema],
  location: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    }
  },
  statistics: {
    dailyIncome: {
      type: Number,
      default: 0
    },
    totalIncome: {
      type: Number,
      default: 0
    },
    trafficCount: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update timestamps
airportSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Airport', airportSchema);