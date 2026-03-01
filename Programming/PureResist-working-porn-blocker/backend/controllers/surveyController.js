const SurveyAnswer = require('../models/SurveyAnswer');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Save user survey answers
// @route   POST /api/users/:userId/survey-answers
// @access  Public
const saveSurveyAnswers = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Extract survey data from request body
    const {
      problemRecognition,
      habitDuration,
      emotionalConsequences,
      identityConflict,
      lossOfControl,
      triggers,
      failedAttempts,
      timeSpent,
      successVision,
      readyForChallenge,
      completedAt
    } = req.body;
    
    // Check if user already has survey answers
    let surveyAnswer = await SurveyAnswer.findOne({ userId });
    
    if (surveyAnswer) {
      // Update existing survey answers
      surveyAnswer.problemRecognition = problemRecognition || surveyAnswer.problemRecognition;
      surveyAnswer.habitDuration = habitDuration || surveyAnswer.habitDuration;
      surveyAnswer.emotionalConsequences = emotionalConsequences || surveyAnswer.emotionalConsequences;
      surveyAnswer.identityConflict = identityConflict || surveyAnswer.identityConflict;
      surveyAnswer.lossOfControl = lossOfControl || surveyAnswer.lossOfControl;
      surveyAnswer.triggers = triggers || surveyAnswer.triggers;
      surveyAnswer.failedAttempts = failedAttempts || surveyAnswer.failedAttempts;
      surveyAnswer.timeSpent = timeSpent || surveyAnswer.timeSpent;
      surveyAnswer.successVision = successVision || surveyAnswer.successVision;
      surveyAnswer.readyForChallenge = readyForChallenge || surveyAnswer.readyForChallenge;
      
      if (completedAt) {
        surveyAnswer.completedAt = new Date(completedAt);
      }
      
      await surveyAnswer.save();
      
      return res.json({
        success: true,
        message: 'Survey answers updated successfully',
        data: surveyAnswer
      });
    }
    
    // Create new survey answers
    surveyAnswer = new SurveyAnswer({
      userId,
      problemRecognition,
      habitDuration,
      emotionalConsequences,
      identityConflict,
      lossOfControl,
      triggers,
      failedAttempts,
      timeSpent,
      successVision,
      readyForChallenge,
      completedAt: completedAt ? new Date(completedAt) : new Date()
    });
    
    await surveyAnswer.save();
    
    res.status(201).json({
      success: true,
      message: 'Survey answers saved successfully',
      data: surveyAnswer
    });
    
  } catch (error) {
    console.error('Error saving survey answers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save survey answers',
      error: error.message
    });
  }
};

// @desc    Get user survey answers
// @route   GET /api/users/:userId/survey-answers
// @access  Public
const getUserSurveyAnswers = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Find survey answers for user
    const surveyAnswer = await SurveyAnswer.findOne({ userId });
    
    if (!surveyAnswer) {
      return res.status(404).json({
        success: false,
        message: 'Survey answers not found for this user'
      });
    }
    
    res.json({
      success: true,
      data: surveyAnswer
    });
    
  } catch (error) {
    console.error('Error getting survey answers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get survey answers',
      error: error.message
    });
  }
};

module.exports = {
  saveSurveyAnswers,
  getUserSurveyAnswers
}; 