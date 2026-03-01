const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chat: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
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

const Message = mongoose.model('Message', messageSchema);

module.exports = Message; 