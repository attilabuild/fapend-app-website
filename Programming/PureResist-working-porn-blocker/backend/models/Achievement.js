const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AchievementSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirement: {
    type: Schema.Types.Mixed, // Can be a number or string
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['streak', 'journal', 'time'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Achievement', AchievementSchema); 