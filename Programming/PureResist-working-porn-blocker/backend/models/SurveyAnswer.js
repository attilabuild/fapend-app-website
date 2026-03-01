const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define Survey Answer Schema
const SurveyAnswerSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemRecognition: {
    type: String
  },
  habitDuration: {
    type: String
  },
  emotionalConsequences: [{
    type: String
  }],
  identityConflict: {
    type: String
  },
  lossOfControl: {
    type: String
  },
  triggers: [{
    type: String
  }],
  failedAttempts: {
    type: String
  },
  timeSpent: {
    type: String
  },
  successVision: {
    type: String
  },
  readyForChallenge: {
    type: String
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create and export the model
module.exports = mongoose.model('SurveyAnswer', SurveyAnswerSchema); 