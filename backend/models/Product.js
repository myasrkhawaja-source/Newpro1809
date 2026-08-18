const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['skincare', 'makeup', 'haircare', 'fragrance', 'tools'],
    required: true
  },
  subcategory: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number
  },
  description: {
    type: String,
    required: true
  },
  ingredients: [String],
  skinTypes: [String],
  image: {
    type: String
  },
  images: [String],
  inStock: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  suitableFor: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);