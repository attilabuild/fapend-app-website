const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const { isValidObjectId } = require('mongoose');

// Get all available achievements
router.get('/', async (req, res) => {
  try {
    const achievements = await Achievement.find().lean();
    
    res.json({
      success: true,
      data: achievements
    });
    
  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get achievements',
      error: error.message
    });
  }
});

// Get all achievements for a user with progress status
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Get all achievements
    const achievements = await Achievement.find().lean();
    
    // Get user's achievement progress
    const userAchievements = await UserAchievement.find({ userId }).lean();
    
    // Map user achievement status to all achievements
    const achievementsWithStatus = achievements.map(achievement => {
      const userAchievement = userAchievements.find(
        ua => ua.achievementId.toString() === achievement._id.toString()
      );
      
      return {
        ...achievement,
        unlocked: userAchievement ? userAchievement.unlocked : false,
        unlockedAt: userAchievement ? userAchievement.unlockedAt : null,
        progress: userAchievement ? userAchievement.progress : 0
      };
    });
    
    res.json({
      success: true,
      data: achievementsWithStatus
    });
    
  } catch (error) {
    console.error('Error getting user achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user achievements',
      error: error.message
    });
  }
});

// Initialize default achievements for new users
router.post('/init', async (req, res) => {
  try {
    // Check if we have any achievements in the database
    const existingAchievements = await Achievement.countDocuments();
    
    // If achievements already exist, skip initialization
    if (existingAchievements > 0) {
      return res.json({
        success: true,
        message: 'Achievements already initialized',
        count: existingAchievements
      });
    }
    
    // Default achievements to create
    const defaultAchievements = [
      // Streak achievements
      {
        title: 'First Step',
        description: 'Complete your first day clean',
        requirement: 1,
        icon: '🌱',
        category: 'streak'
      },
      {
        title: 'Three Day Milestone',
        description: 'Complete 3 days clean',
        requirement: 3,
        icon: '🌿',
        category: 'streak'
      },
      {
        title: 'One Week Strong',
        description: 'Complete 7 days',
        requirement: 7,
        icon: '🌟',
        category: 'streak'
      },
      {
        title: 'Double Digits',
        description: 'Reach a 10-day streak',
        requirement: 10,
        icon: '🔟',
        category: 'streak'
      },
      {
        title: 'Two Week Warrior',
        description: 'Complete 14 days',
        requirement: 14,
        icon: '⚔️',
        category: 'streak'
      },
      {
        title: 'Bronze Medal',
        description: 'Complete 30 days',
        requirement: 30,
        icon: '🥉',
        category: 'streak'
      },
      {
        title: 'Silver Medal',
        description: 'Complete 60 days',
        requirement: 60,
        icon: '🥈',
        category: 'streak'
      },
      {
        title: 'Gold Medal',
        description: 'Complete 90 days',
        requirement: 90,
        icon: '🥇',
        category: 'streak'
      },
      {
        title: 'Six Month Legend',
        description: 'Complete 180 days',
        requirement: 180,
        icon: '👑',
        category: 'streak'
      },
      {
        title: 'One Year Club',
        description: 'Complete 365 days',
        requirement: 365,
        icon: '🏆',
        category: 'streak'
      },
      
      // Journal achievements
      {
        title: 'Daily Reflection',
        description: 'Journal for 3 days in a row',
        requirement: 3,
        icon: '📝',
        category: 'journal'
      },
      {
        title: 'Consistent Writer',
        description: 'Journal for 7 days in a row',
        requirement: 7,
        icon: '📓',
        category: 'journal'
      },
      {
        title: 'Reflection Master',
        description: 'Journal for 30 days in a row',
        requirement: 30,
        icon: '✒️',
        category: 'journal'
      },
      
      // Time-based achievements (in minutes)
      {
        title: 'First Minute',
        description: 'Stay clean for 1 minute',
        requirement: 1,
        icon: '🕐',
        category: 'time'
      },
      {
        title: 'First Hour',
        description: 'Stay clean for 1 hour',
        requirement: 60,
        icon: '⏰',
        category: 'time'
      },
      {
        title: 'Six Hours Strong',
        description: 'Stay clean for 6 hours',
        requirement: 360,
        icon: '🕕',
        category: 'time'
      },
      {
        title: 'First Day Victory',
        description: 'Stay clean for 24 hours',
        requirement: 1440,
        icon: '📅',
        category: 'time'
      },
      {
        title: 'Three Days Warrior',
        description: 'Stay clean for 3 days',
        requirement: 4320,
        icon: '🗓️',
        category: 'time'
      },
      
      // Learning achievements
      {
        title: 'Knowledge Seeker',
        description: 'Complete 5 lessons',
        requirement: 5,
        icon: '🧠',
        category: 'learning'
      },
      {
        title: 'Wisdom Collector',
        description: 'Complete all basic lessons',
        requirement: 'all',
        icon: '📚',
        category: 'learning'
      }
    ];
    
    // Insert all default achievements
    await Achievement.insertMany(defaultAchievements);
    
    res.json({
      success: true,
      message: 'Default achievements initialized successfully',
      count: defaultAchievements.length
    });
    
  } catch (error) {
    console.error('Error initializing achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize achievements',
      error: error.message
    });
  }
});

// Update user achievement progress
router.post('/progress', async (req, res) => {
  try {
    const { userId, streakDays, journalCount, lessonsRead, streakStarted } = req.body;
    
    // Validate userId
    if (!userId || !isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required'
      });
    }
    
    // Get all achievements
    const achievements = await Achievement.find().lean();
    
    // Get existing user achievements to avoid overwriting unlocked achievements
    const existingUserAchievements = await UserAchievement.find({ userId }).lean();
    
    // Track which achievements are newly unlocked
    const newlyUnlocked = [];
    
    // Process each achievement
    for (const achievement of achievements) {
      try {
        // Skip processing if we don't have relevant data for this achievement category
        if (
          (achievement.category === 'streak' && streakDays === undefined) ||
          (achievement.category === 'journal' && journalCount === undefined) ||
          (achievement.category === 'learning' && lessonsRead === undefined) ||
          (achievement.category === 'time' && !streakStarted)
        ) {
          continue;
        }
        
        // Find existing user achievement record if any
        const existingAchievement = existingUserAchievements.find(
          ua => ua.achievementId.toString() === achievement._id.toString()
        );
        
        // If achievement is already unlocked, skip updating it
        if (existingAchievement && existingAchievement.unlocked) {
          continue;
        }
        
        let shouldUnlock = false;
        let progress = 0;
        
        // Check streak achievements
        if (achievement.category === 'streak' && typeof achievement.requirement === 'number' && streakDays !== undefined) {
          progress = Math.min(100, (streakDays / achievement.requirement) * 100);
          shouldUnlock = streakDays >= achievement.requirement;
        }
        
        // Check journal achievements
        if (achievement.category === 'journal' && typeof achievement.requirement === 'number' && journalCount !== undefined) {
          progress = Math.min(100, (journalCount / achievement.requirement) * 100);
          shouldUnlock = journalCount >= achievement.requirement;
        }
        
        // Check learning achievements
        if (achievement.category === 'learning' && lessonsRead !== undefined) {
          if (typeof achievement.requirement === 'number') {
            progress = Math.min(100, (lessonsRead / achievement.requirement) * 100);
            shouldUnlock = lessonsRead >= achievement.requirement;
          } else if (achievement.requirement === 'all' && lessonsRead >= 10) {
            // Assuming "all" means 10 lessons for this example
            progress = 100;
            shouldUnlock = true;
          }
        }
        
        // Check time-based achievements
        if (achievement.category === 'time' && typeof achievement.requirement === 'number' && streakStarted) {
          const now = new Date();
          const streakStart = new Date(streakStarted);
          const minutesElapsed = Math.floor((now.getTime() - streakStart.getTime()) / (1000 * 60));
          
          progress = Math.min(100, (minutesElapsed / achievement.requirement) * 100);
          shouldUnlock = minutesElapsed >= achievement.requirement;
        }
        
        // Only update if we have an update (either progress changed or should be unlocked)
        if (shouldUnlock || (existingAchievement && progress > existingAchievement.progress)) {
          // Prepare update data
          const updateData = {
            progress: progress
          };
          
          if (shouldUnlock) {
            updateData.unlocked = true;
            updateData.unlockedAt = new Date();
          }
          
          // Use findOneAndUpdate with upsert instead of creating and saving
          const updatedAchievement = await UserAchievement.findOneAndUpdate(
            { userId, achievementId: achievement._id },
            updateData,
            { new: true, upsert: true, setDefaultsOnInsert: true }
          );
          
          if (shouldUnlock && updatedAchievement.unlocked) {
            newlyUnlocked.push(achievement);
          }
        }
      } catch (error) {
        console.error(`Error processing achievement ${achievement._id}:`, error);
        // Continue with other achievements even if one fails
      }
    }
    
    res.json({
      success: true,
      message: `User achievement progress updated`,
      newlyUnlocked
    });
    
  } catch (error) {
    console.error('Error updating achievement progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update achievement progress',
      error: error.message
    });
  }
});

// Manually unlock an achievement for a user
router.post('/unlock', async (req, res) => {
  try {
    const { userId, achievementId } = req.body;
    
    // Validate required fields
    if (!userId || !achievementId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and achievement ID are required'
      });
    }
    
    // Validate ObjectIds
    if (!isValidObjectId(userId) || !isValidObjectId(achievementId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    
    // Check if achievement exists
    const achievement = await Achievement.findById(achievementId);
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }
    
    // Use findOneAndUpdate with upsert to avoid duplicate key error
    const userAchievement = await UserAchievement.findOneAndUpdate(
      { userId, achievementId },
      { 
        unlocked: true,
        unlockedAt: new Date(),
        progress: 100
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    res.json({
      success: true,
      message: 'Achievement unlocked successfully',
      data: userAchievement
    });
    
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlock achievement',
      error: error.message
    });
  }
});

module.exports = router; 