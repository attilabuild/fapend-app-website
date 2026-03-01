const User = require('../models/User');

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Search users by username or email
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // Find users matching the search query in username or email
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('_id username email currentStreak longestStreak');
    
    // Return empty array instead of 404 when no users found
    return res.status(200).json({
      success: true,
      data: users,
      message: users.length === 0 ? 'No users found with that username or email' : undefined
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Register new user
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password, // Password will be hashed by the pre-save hook
      // Default values will be set by the schema
    });
    
    await user.save();
    
    // Return user data without password
    const userData = user.toObject();
    delete userData.password;
    
    res.status(201).json({
      success: true,
      data: userData,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }
    
    if (!username && !email) {
      return res.status(400).json({
        success: false,
        message: 'Username or email is required'
      });
    }
    
    // Find user by username or email
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else {
      user = await User.findOne({ username });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check password using the comparePassword method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Return user data without password
    const userData = user.toObject();
    delete userData.password;
    
    res.status(200).json({
      success: true,
      data: userData,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update user streak
const updateUserStreak = async (userId, succeeded) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    const now = new Date();
    
    if (succeeded) {
      // Increment streak if succeeded
      user.streak += 1;
      
      // Update longest streak if current streak is longer
      if (user.streak > user.longestStreak) {
        user.longestStreak = user.streak;
      }
      
      // If this is the first check-in (streak was 0), set streakStarted to now
      if (user.streak === 1) {
        user.streakStarted = now;
      }
    } else {
      // Reset streak to 0 if failed
      user.streak = 0;
      // Reset streak started date when streak is reset
      user.streakStarted = now;
      // Set last relapse date
      user.lastRelapse = now;
    }
    
    // Update last check-in date
    user.lastCheckIn = now;
    
    await user.save();
    return { success: true, user };
  } catch (error) {
    console.error('Error updating user streak:', error);
    return { success: false, error: error.message };
  }
};

// Get user settings
const getUserSettings = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('settings');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      data: user.settings
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update user settings
const updateUserSettings = async (req, res) => {
  try {
    const userId = req.params.id;
    const newSettings = req.body.settings;
    
    if (!newSettings) {
      return res.status(400).json({
        success: false,
        message: 'Settings data is required'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update settings
    user.settings = { ...user.settings.toObject(), ...newSettings };
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user.settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete user account
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Clean up associated data
    try {
      // Import models if they exist in the app
      const Chat = require('../models/Chat');
      const Message = require('../models/Message');
      const CheckIn = require('../models/CheckIn');
      
      // Delete user's chats
      if (Chat) {
        // Find chats where the user is the only participant
        const userChats = await Chat.find({ participants: userId });
        
        for (const chat of userChats) {
          // Only delete chats if the user is the only participant
          if (chat.participants.length === 1) {
            await Chat.findByIdAndDelete(chat._id);
          } else {
            // Otherwise just remove the user from participants
            await Chat.findByIdAndUpdate(
              chat._id, 
              { $pull: { participants: userId } }
            );
          }
        }
      }
      
      // Delete user's messages (optional - some apps keep messages)
      if (Message) {
        await Message.deleteMany({ sender: userId });
      }
      
      // Delete user's check-ins
      if (CheckIn) {
        await CheckIn.deleteMany({ userId });
      }
      
    } catch (cleanupError) {
      console.error('Error cleaning up user data:', cleanupError);
      // Continue with deletion even if cleanup fails
    }
    
    // Delete user data
    await User.findByIdAndDelete(userId);
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'User account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Export controller functions
module.exports = {
  getUserById,
  registerUser,
  loginUser,
  updateUserStreak,
  getUserSettings,
  updateUserSettings,
  searchUsers,
  deleteUser
}; 