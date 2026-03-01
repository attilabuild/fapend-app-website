const express = require('express');
const router = express.Router();
const {
  getUserById,
  registerUser,
  loginUser,
  getUserSettings,
  updateUserSettings,
  searchUsers,
  deleteUser
} = require('../controllers/userController');
const { saveSurveyAnswers, getUserSurveyAnswers } = require('../controllers/surveyController');
const { isValidObjectId } = require('mongoose');
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

// @route   GET /api/users/search
// @desc    Search users by username or email
// @access  Public
router.get('/search', searchUsers);

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', getUserById);

// @route   GET /api/users/:id/settings
// @desc    Get user settings
// @access  Public
router.get('/:id/settings', getUserSettings);

// @route   PUT /api/users/:id/settings
// @desc    Update user settings
// @access  Public
router.put('/:id/settings', updateUserSettings);

// @route   DELETE /api/users/:id
// @desc    Delete user account
// @access  Public
router.delete('/:id', deleteUser);

// Get user's friends
router.get('/:userId/friends', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Find user's friends
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user's friends (simplified version - in a real app, you'd have a proper friends system)
    const friends = await User.find({ 
      _id: { $in: user.friends || [] } 
    }).select('_id username createdAt streak longestStreak');
    
    res.json({
      success: true,
      data: friends
    });
    
  } catch (error) {
    console.error('Error getting user friends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user friends',
      error: error.message
    });
  }
});

// Get pending friend requests
router.get('/:userId/friend-requests', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Find user's pending friend requests
    const friendRequests = await FriendRequest.find({
      $or: [
        { senderId: userId, status: 'pending' },
        { receiverId: userId, status: 'pending' }
      ]
    }).populate('senderId receiverId', '_id username');
    
    res.json({
      success: true,
      data: friendRequests
    });
    
  } catch (error) {
    console.error('Error getting friend requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get friend requests',
      error: error.message
    });
  }
});

// Send a friend request
router.post('/friend-request', async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    
    // Validate user IDs
    if (!isValidObjectId(senderId) || !isValidObjectId(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Check if users exist
    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId)
    ]);
    
    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: 'One or both users not found'
      });
    }
    
    // Check if already friends
    if (sender.friends && sender.friends.includes(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'Users are already friends'
      });
    }
    
    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { senderId, receiverId, status: 'pending' },
        { senderId: receiverId, receiverId: senderId, status: 'pending' }
      ]
    });
    
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'A friend request already exists between these users'
      });
    }
    
    // Create new friend request
    const friendRequest = new FriendRequest({
      senderId,
      receiverId,
      status: 'pending',
      createdAt: new Date()
    });
    
    await friendRequest.save();
    
    res.json({
      success: true,
      message: 'Friend request sent successfully',
      data: friendRequest
    });
    
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send friend request',
      error: error.message
    });
  }
});

// Accept or reject a friend request
router.put('/friend-request/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "accepted" or "rejected"'
      });
    }
    
    // Find and update the request
    const friendRequest = await FriendRequest.findById(requestId);
    
    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }
    
    if (friendRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed'
      });
    }
    
    friendRequest.status = status;
    friendRequest.updatedAt = new Date();
    
    await friendRequest.save();
    
    // If accepted, add each user to the other's friends list
    if (status === 'accepted') {
      const [sender, receiver] = await Promise.all([
        User.findById(friendRequest.senderId),
        User.findById(friendRequest.receiverId)
      ]);
      
      if (!sender || !receiver) {
        return res.status(404).json({
          success: false,
          message: 'One or both users not found'
        });
      }
      
      // Add to friends arrays
      if (!sender.friends) sender.friends = [];
      if (!receiver.friends) receiver.friends = [];
      
      sender.friends.push(friendRequest.receiverId);
      receiver.friends.push(friendRequest.senderId);
      
      await Promise.all([sender.save(), receiver.save()]);
    }
    
    res.json({
      success: true,
      message: `Friend request ${status}`,
      data: friendRequest
    });
    
  } catch (error) {
    console.error('Error processing friend request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process friend request',
      error: error.message
    });
  }
});

// Update streak started date
router.put('/:userId/streak-started', async (req, res) => {
  try {
    const { userId } = req.params;
    const { streakStarted } = req.body;
    
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update the streak started date
    user.streakStarted = new Date(streakStarted);
    await user.save();
    
    res.json({
      success: true,
      data: {
        streakStarted: user.streakStarted
      },
      message: 'Streak started date updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating streak started date:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update streak started date',
      error: error.message
    });
  }
});

// Update last relapse date
router.put('/:userId/last-relapse', async (req, res) => {
  try {
    const { userId } = req.params;
    const { lastRelapse } = req.body;
    
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update the last relapse date
    user.lastRelapse = new Date(lastRelapse);
    await user.save();
    
    res.json({
      success: true,
      data: {
        lastRelapse: user.lastRelapse
      },
      message: 'Last relapse date updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating last relapse date:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update last relapse date',
      error: error.message
    });
  }
});

// Get user relapses (from failed check-ins)
router.get('/:userId/relapses', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Find the user first to ensure they exist
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get relapses from CheckIn model where succeeded = false
    const CheckIn = require('../models/CheckIn');
    const relapses = await CheckIn.find({ 
      userId: userId, 
      succeeded: false 
    }).sort({ date: -1 }); // Sort by date, newest first
    
    // Transform the check-in data to match the expected relapse format
    const transformedRelapses = relapses.map(checkIn => ({
      _id: checkIn._id,
      userId: checkIn.userId,
      date: checkIn.date,
      timestamp: checkIn.date.toISOString(),
      triggers: checkIn.triggers || [],
      mood: checkIn.mood,
      notes: checkIn.notes || '',
      createdAt: checkIn.createdAt,
      updatedAt: checkIn.updatedAt
    }));
    
    res.json({
      success: true,
      data: transformedRelapses,
      message: 'User relapses retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error getting user relapses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user relapses',
      error: error.message
    });
  }
});

// Get last relapse date
router.get('/:userId/last-relapse', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Return the last relapse date
    res.json({
      success: true,
      data: user.lastRelapse,
      message: 'Last relapse date retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error getting last relapse date:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get last relapse date',
      error: error.message
    });
  }
});

// Get streak started date
router.get('/:userId/streak-started', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Return the streak started date
    res.json({
      success: true,
      data: user.streakStarted,
      message: 'Streak started date retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error getting streak started date:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get streak started date',
      error: error.message
    });
  }
});

// @route   POST /api/users/:userId/survey-answers
// @desc    Save user survey answers
// @access  Public
router.post('/:userId/survey-answers', saveSurveyAnswers);

// @route   GET /api/users/:userId/survey-answers
// @desc    Get user survey answers
// @access  Public
router.get('/:userId/survey-answers', getUserSurveyAnswers);

// Update user subscription
router.put('/:userId/subscription', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isSubscribed, subscriptionStartDate, subscriptionEndDate } = req.body;
    
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update subscription info
    user.isSubscribed = isSubscribed;
    if (subscriptionStartDate) {
      user.subscriptionStartDate = new Date(subscriptionStartDate);
    }
    if (subscriptionEndDate) {
      user.subscriptionEndDate = new Date(subscriptionEndDate);
    }
    
    await user.save();
    
    res.json({
      success: true,
      data: {
        isSubscribed: user.isSubscribed,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate
      },
      message: 'Subscription updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription',
      error: error.message
    });
  }
});

module.exports = router; 