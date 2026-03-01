const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

// Define User Schema
const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  isSubscribed: {
    type: Boolean,
    default: false
  },
  subscriptionStartDate: {
    type: Date,
    default: null
  },
  subscriptionEndDate: {
    type: Date,
    default: null
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
    required: true
  },
  streak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastCheckIn: {
    type: Date,
    default: null
  },
  lastRelapse: {
    type: Date,
    default: null
  },
  streakStarted: {
    type: Date,
    default: Date.now  // Default to creation time
  },
  // Array of achievement IDs that the user has unlocked
  achievements: [{
    type: Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  settings: {
    notifications: {
      enabled: {
        type: Boolean,
        default: true
      },
      time: {
        type: String,
        default: '19:00' // Default reminder time
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    goalDays: {
      type: Number,
      default: 90 // Default NoFap goal is 90 days
    }
  },
  isSubscribed: {
    type: Boolean,
    default: false
  },
  subscriptionStartDate: {
    type: Date,
    default: null
  },
  trialEndsAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Create and export the model
module.exports = mongoose.model('User', UserSchema); 