const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  readBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better query performance
MessageSchema.index({ chatId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema); 