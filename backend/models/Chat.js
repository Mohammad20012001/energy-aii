const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ['user', 'ai'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }
);

const chatSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      default: 'New Chat',
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Chat', chatSchema);
