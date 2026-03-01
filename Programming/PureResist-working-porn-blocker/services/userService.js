const User = require('../models/User');
const { DatabaseService } = require('../utils/databaseService');

// Create a service for User operations
class UserService extends DatabaseService {
  constructor() {
    super(User);
  }

  // Get user by email
  async findByEmail(email) {
    return this.findOne({ email });
  }

  // Get user by username
  async findByUsername(username) {
    return this.findOne({ username });
  }

  // Update user streak
  async updateStreak(userId, newStreakData) {
    return this.updateById(userId, {
      currentStreak: newStreakData.currentStreak,
      longestStreak: newStreakData.longestStreak,
      lastCheckIn: newStreakData.lastCheckIn || new Date(),
      // Only update streakStarted if it's provided and it's a new streak
      ...(newStreakData.streakStarted && { streakStarted: newStreakData.streakStarted })
    });
  }

  // Register relapse
  async recordRelapse(userId) {
    const now = new Date();
    return this.updateById(userId, {
      currentStreak: 0,
      lastRelapse: now,
      streakStarted: now // Reset streak start date to the time of relapse
    });
  }

  // Add achievement to user
  async addAchievement(userId, achievementId) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if achievement already exists
    if (user.achievements.includes(achievementId)) {
      return user;
    }

    // Add achievement
    user.achievements.push(achievementId);
    return user.save();
  }
}

// Export a singleton instance
const userService = new UserService();
module.exports = userService; 