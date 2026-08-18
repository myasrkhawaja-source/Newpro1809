const mongoose = require('mongoose');

const beautyProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skinType: {
    type: String,
    enum: ['oily', 'dry', 'combination', 'sensitive', 'normal'],
    required: true
  },
  hairType: {
    type: String,
    enum: ['straight', 'wavy', 'curly', 'coily', 'damaged'],
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  preferences: {
    style: String,
    occasion: String,
    concerns: [String]
  },
  currentProducts: [{
    name: String,
    category: String
  }],
  allergies: [String],
  routine: [{
    step: String,
    product: String,
    time: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('BeautyProfile', beautyProfileSchema);