const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'banned'],
    default: 'active'
  },
  gameProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameProfile'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastOnline: {
    type: Date,
    default: Date.now
  },
  totalOnlineTime: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('User', userSchema);