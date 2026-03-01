const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserAchievementSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievementId: {
    type: Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true
  },
  unlocked: {
    type: Boolean,
    default: false
  },
  unlockedAt: {
    type: Date,
    default: null
  },
  progress: {
    type: Number,
    default: 0
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

// Compound index to ensure a user can only have one record per achievement
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

module.exports = mongoose.model('UserAchievement', UserAchievementSchema); 