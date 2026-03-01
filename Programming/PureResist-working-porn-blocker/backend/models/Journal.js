const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JournalSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'bad', 'awful'],
    default: 'okay'
  },
  triggers: {
    type: [String],
    default: []
  },
  isPrivate: {
    type: Boolean,
    default: true
  },
  day: {
    type: Number,
    default: 0
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

module.exports = mongoose.model('Journal', JournalSchema); 