const express = require('express');
const router = express.Router();
const {
  getUserCheckIns,
  createCheckIn,
  getUserStats
} = require('../controllers/checkInController');

// @route   GET /api/checkins/user/:userId
// @desc    Get all check-ins for a user
// @access  Public
router.get('/user/:userId', getUserCheckIns);

// @route   POST /api/checkins
// @desc    Create a new check-in
// @access  Public
router.post('/', createCheckIn);

// @route   GET /api/checkins/stats/:userId
// @desc    Get statistics for a user
// @access  Public
router.get('/stats/:userId', getUserStats);

module.exports = router; 