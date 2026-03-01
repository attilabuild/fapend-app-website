const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isValidObjectId } = require('mongoose');

// Get user settings
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user.settings || {}
    });
  } catch (error) {
    console.error('Error getting user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user settings',
      error: error.message
    });
  }
});

// Update user settings
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { settings } = req.body;
    
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    if (!settings) {
      return res.status(400).json({
        success: false,
        message: 'Settings data is required'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user settings
    user.settings = {
      ...(user.settings || {}),
      ...settings
    };
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: user.settings
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user settings',
      error: error.message
    });
  }
});

module.exports = router; 