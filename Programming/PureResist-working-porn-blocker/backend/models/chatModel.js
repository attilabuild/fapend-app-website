const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  type: {
    type: String,
    enum: ['direct', 'group'],
    required: true
  },
  name: {
    type: String,
    trim: true,
    // Only required for group chats
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
  }
});

// Ensure at least 2 participants
chatSchema.pre('save', function(next) {
  if (this.participants.length < 2) {
    const error = new Error('A chat requires at least 2 participants');
    return next(error);
  }
  next();
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat; 