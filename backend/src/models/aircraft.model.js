const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  source: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Airport',
    required: true
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Airport',
    required: true
  },
  departureTime: {
    type: Date,
    required: true
  },
  arrivalTime: {
    type: Date,
    required: true
  },
  income: {
    type: Number,
    default: 0
  },
  routeDistance: {
    type: Number,
    required: true
  }
});

const aircraftSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  model: {
    type: String,
    enum: ['ARJ21-700', 'ARJ21-900', 'C919-A', 'C919-B', 'A320', 'A330', 'A350'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  purchasePrice: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  maintenanceCost: {
    type: Number,
    required: true
  },
  currentLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Airport'
  },
  status: {
    type: String,
    enum: ['parked', 'in-flight', 'maintenance'],
    default: 'parked'
  },
  activeRoute: routeSchema,
  condition: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  earnings: {
    daily: {
      type: Number,
      default: 0
    },
    total: {
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
aircraftSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Aircraft', aircraftSchema);