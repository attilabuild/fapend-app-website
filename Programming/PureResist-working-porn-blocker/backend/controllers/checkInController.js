const CheckIn = require('../models/CheckIn');
const { updateUserStreak } = require('./userController');

// Get all check-ins for a user
const getUserCheckIns = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get check-ins sorted by date (newest first)
    const checkIns = await CheckIn.find({ userId })
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: checkIns.length,
      data: checkIns
    });
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new check-in
const createCheckIn = async (req, res) => {
  try {
    const { userId, mood, urgeLevel, succeeded, notes, triggers, activities, dayNumber } = req.body;
    
    if (!userId || mood === undefined || urgeLevel === undefined || succeeded === undefined || dayNumber === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Create check-in
    const checkIn = new CheckIn({
      userId,
      mood,
      urgeLevel,
      succeeded,
      notes: notes || '',
      triggers: triggers || [],
      activities: activities || [],
      dayNumber
    });
    
    await checkIn.save();
    
    // Update user streak based on check-in result
    const updateResult = await updateUserStreak(userId, succeeded);
    
    if (!updateResult.success) {
      return res.status(400).json({
        success: false,
        message: updateResult.message || 'Failed to update user streak',
        error: updateResult.error
      });
    }
    
    res.status(201).json({
      success: true,
      data: checkIn,
      message: 'Check-in recorded successfully',
      userStreak: updateResult.user.streak,
      userLongestStreak: updateResult.user.longestStreak
    });
  } catch (error) {
    console.error('Error creating check-in:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get statistics for a user
const getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get total check-ins
    const totalCheckIns = await CheckIn.countDocuments({ userId });
    
    // Get successful check-ins
    const successfulCheckIns = await CheckIn.countDocuments({ 
      userId, 
      succeeded: true 
    });
    
    // Calculate success rate
    const successRate = totalCheckIns > 0 
      ? (successfulCheckIns / totalCheckIns) * 100 
      : 0;
    
    // Get last 30 days of check-ins for trend analysis
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCheckIns = await CheckIn.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });
    
    // Get average urge level
    const avgUrgeLevel = recentCheckIns.length > 0
      ? recentCheckIns.reduce((sum, checkIn) => sum + checkIn.urgeLevel, 0) / recentCheckIns.length
      : 0;
    
    res.status(200).json({
      success: true,
      data: {
        totalCheckIns,
        successfulCheckIns,
        successRate: successRate.toFixed(2),
        avgUrgeLevel: avgUrgeLevel.toFixed(2),
        recentCheckIns
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getUserCheckIns,
  createCheckIn,
  getUserStats
}; 