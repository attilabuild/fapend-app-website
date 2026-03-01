const express = require('express');
const router = express.Router();
const { isValidObjectId } = require('mongoose');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const chatController = require('../controllers/chatController');

// Get all chats for a user
router.get('/user/:userId', chatController.getUserChats);

// Get a specific chat with messages
router.get('/:chatId', chatController.getChatWithMessages);

// Create a new group chat
router.post('/group', chatController.createGroupChat);

// Create or get a direct message chat
router.post('/direct', chatController.createOrGetDirectChat);

// Send a message to a chat
router.post('/:chatId/messages', chatController.sendMessage);

// Get all available group chats
router.get('/groups', chatController.getGroupChats);

// Join a group chat
router.post('/:chatId/join', chatController.joinGroupChat);

module.exports = router; 