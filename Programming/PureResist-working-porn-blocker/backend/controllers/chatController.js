const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all chats for a specific user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find chats where the user is a participant
    const chats = await Chat.find({
      participants: userId
    })
    .populate('participants', '_id username')
    .populate('createdBy', '_id username')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: '_id username'
      }
    })
    .sort({ lastActivity: -1 });
    
    return res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Error fetching user chats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: error.message
    });
  }
};

// Get a specific chat with its messages
exports.getChatWithMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.query.userId;
    
    // Validate that the user is a participant in this chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    })
    .populate('participants', '_id username')
    .populate('createdBy', '_id username');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or user not authorized'
      });
    }
    
    // Get messages for this chat
    const messages = await Message.find({ chatId: chatId })
      .populate('sender', '_id username')
      .sort({ createdAt: 1 });
    
    // Mark messages as "mine" if sent by the requesting user
    const processedMessages = messages.map(message => {
      const messageObj = message.toObject();
      messageObj.isMine = message.sender._id.toString() === userId;
      return messageObj;
    });
    
    return res.json({
      success: true,
      data: {
        chat,
        messages: processedMessages
      }
    });
  } catch (error) {
    console.error('Error fetching chat with messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch chat with messages',
      error: error.message
    });
  }
};

// Create a new group chat
exports.createGroupChat = async (req, res) => {
  try {
    const { name, participantIds, createdById } = req.body;
    
    // Ensure we have at least 2 participants
    if (!participantIds || participantIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'A group chat requires at least 2 participants'
      });
    }
    
    // Check if we already have a group chat with the same name
    const existingChat = await Chat.findOne({
      type: 'group',
      name
    });
    
    if (existingChat) {
      // If a chat with this name already exists, add the creator if they're not already a participant
      if (!existingChat.participants.includes(createdById)) {
        existingChat.participants.push(createdById);
        await existingChat.save();
      }
      
      // Return the existing chat
      const populatedChat = await Chat.findById(existingChat._id)
        .populate('participants', '_id username')
        .populate('createdBy', '_id username');
      
      return res.json({
        success: true,
        data: populatedChat,
        message: 'Joined existing group chat'
      });
    }
    
    // Create a new group chat
    const newChat = new Chat({
      type: 'group',
      name,
      participants: participantIds,
      createdBy: createdById,
      lastActivity: new Date()
    });
    
    await newChat.save();
    
    // Return the populated chat object
    const populatedChat = await Chat.findById(newChat._id)
      .populate('participants', '_id username')
      .populate('createdBy', '_id username');
    
    return res.json({
      success: true,
      data: populatedChat,
      message: 'Group chat created successfully'
    });
  } catch (error) {
    console.error('Error creating group chat:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create group chat',
      error: error.message
    });
  }
};

// Create or get a direct chat between two users
exports.createOrGetDirectChat = async (req, res) => {
  try {
    const { userId, otherUserId } = req.body;
    
    // Validate that both users exist
    const [user, otherUser] = await Promise.all([
      User.findById(userId),
      User.findById(otherUserId)
    ]);
    
    if (!user || !otherUser) {
      return res.status(404).json({
        success: false,
        message: 'One or both users not found'
      });
    }
    
    // Check if a direct chat already exists between these users
    const existingChat = await Chat.findOne({
      type: 'direct',
      participants: { $all: [userId, otherUserId] }
    })
    .populate('participants', '_id username')
    .populate('createdBy', '_id username');
    
    if (existingChat) {
      return res.json({
        success: true,
        data: existingChat,
        message: 'Direct chat already exists'
      });
    }
    
    // Create a new direct chat
    const newChat = new Chat({
      type: 'direct',
      participants: [userId, otherUserId],
      createdBy: userId,
      lastActivity: new Date()
    });
    
    await newChat.save();
    
    // Return the populated chat object
    const populatedChat = await Chat.findById(newChat._id)
      .populate('participants', '_id username')
      .populate('createdBy', '_id username');
    
    return res.json({
      success: true,
      data: populatedChat,
      message: 'Direct chat created successfully'
    });
  } catch (error) {
    console.error('Error creating/getting direct chat:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create/get direct chat',
      error: error.message
    });
  }
};

// Send a message to a chat
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { senderId, content } = req.body;
    
    // Validate that the chat exists and the sender is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: senderId
    });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or user not authorized'
      });
    }
    
    // Create a new message
    const newMessage = new Message({
      content,
      sender: senderId,
      chatId: chatId,
      readBy: [senderId],
      createdAt: new Date()
    });
    
    await newMessage.save();
    
    // Update the chat's lastMessage and lastActivity
    chat.lastMessage = newMessage._id;
    chat.lastActivity = new Date();
    await chat.save();
    
    // Return the populated message
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', '_id username');
    
    const messageObj = populatedMessage.toObject();
    messageObj.isMine = true; // For the sender, mark as mine
    
    return res.status(201).json({
      success: true,
      data: messageObj,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Find all available group chats
exports.getGroupChats = async (req, res) => {
  try {
    const groupChats = await Chat.find({
      type: 'group'
    })
    .populate('participants', '_id username')
    .populate('createdBy', '_id username')
    .sort({ lastActivity: -1 });
    
    return res.json({
      success: true,
      data: groupChats
    });
  } catch (error) {
    console.error('Error fetching group chats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch group chats',
      error: error.message
    });
  }
};

// Join a group chat
exports.joinGroupChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;
    
    // Find the chat
    const chat = await Chat.findById(chatId);
    
    if (!chat || chat.type !== 'group') {
      return res.status(404).json({
        success: false,
        message: 'Group chat not found'
      });
    }
    
    // Check if user is already in the chat
    if (chat.participants.includes(userId)) {
      // User is already a participant, return the chat
      const populatedChat = await Chat.findById(chat._id)
        .populate('participants', '_id username')
        .populate('createdBy', '_id username');
      
      return res.json({
        success: true,
        data: populatedChat,
        message: 'Already a member of this group chat'
      });
    }
    
    // Add user to participants
    chat.participants.push(userId);
    await chat.save();
    
    // Return the populated chat
    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', '_id username')
      .populate('createdBy', '_id username');
    
    return res.json({
      success: true,
      data: populatedChat,
      message: 'Successfully joined group chat'
    });
  } catch (error) {
    console.error('Error joining group chat:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to join group chat',
      error: error.message
    });
  }
}; 