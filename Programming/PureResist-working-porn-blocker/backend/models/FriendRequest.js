const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FriendRequestSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
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

// Add compound index to ensure uniqueness
FriendRequestSchema.index(
  { senderId: 1, receiverId: 1 }, 
  { unique: true }
);

module.exports = mongoose.model('FriendRequest', FriendRequestSchema); 