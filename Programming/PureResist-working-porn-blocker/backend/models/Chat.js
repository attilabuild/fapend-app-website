const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
  type: {
    type: String,
    enum: ['direct', 'group'],
    required: true
  },
  name: {
    type: String,
    required: function() {
      return this.type === 'group';
    }
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// For direct messages, we need to ensure only one chat exists between two users
// Create a compound index for direct chats
ChatSchema.index(
  { 
    type: 1,
    participants: 1
  },
  { 
    unique: true,
    partialFilterExpression: { type: 'direct' }
  }
);

// Update the lastActivity timestamp when a chat is updated
ChatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.lastActivity = Date.now();
  next();
});

module.exports = mongoose.model('Chat', ChatSchema); 