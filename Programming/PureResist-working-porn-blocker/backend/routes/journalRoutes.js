const express = require('express');
const router = express.Router();
const Journal = require('../models/Journal');
const { isValidObjectId } = require('mongoose');

// Get all journals for a user
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
    
    // Get journals for the user
    const journals = await Journal.find({ userId })
      .sort({ date: -1 }) // Sort by date, newest first
      .lean();
    
    res.json({
      success: true,
      data: journals
    });
    
  } catch (error) {
    console.error('Error getting user journals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get journals',
      error: error.message
    });
  }
});

// Get a single journal entry
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate journal ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid journal ID format'
      });
    }
    
    // Find the journal
    const journal = await Journal.findById(id).lean();
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }
    
    res.json({
      success: true,
      data: journal
    });
    
  } catch (error) {
    console.error('Error getting journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get journal entry',
      error: error.message
    });
  }
});

// Create a new journal entry
router.post('/', async (req, res) => {
  try {
    const { userId, content, mood, triggers, isPrivate, day } = req.body;
    
    // Validate required fields
    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        message: 'User ID and content are required'
      });
    }
    
    // Create journal entry
    const newJournal = new Journal({
      userId,
      content,
      mood: mood || 'okay',
      triggers: triggers || [],
      isPrivate: isPrivate !== undefined ? isPrivate : true,
      day: day || 0,
      date: new Date()
    });
    
    // Save the entry
    await newJournal.save();
    
    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      data: newJournal
    });
    
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create journal entry',
      error: error.message
    });
  }
});

// Update a journal entry
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, mood, triggers, isPrivate } = req.body;
    
    // Validate journal ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid journal ID format'
      });
    }
    
    // Find the journal
    const journal = await Journal.findById(id);
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }
    
    // Update fields
    if (content) journal.content = content;
    if (mood) journal.mood = mood;
    if (triggers) journal.triggers = triggers;
    if (isPrivate !== undefined) journal.isPrivate = isPrivate;
    
    journal.updatedAt = new Date();
    
    // Save the updated entry
    await journal.save();
    
    res.json({
      success: true,
      message: 'Journal entry updated successfully',
      data: journal
    });
    
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update journal entry',
      error: error.message
    });
  }
});

// Delete a journal entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate journal ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid journal ID format'
      });
    }
    
    // Find and delete the journal
    const result = await Journal.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete journal entry',
      error: error.message
    });
  }
});

module.exports = router; 