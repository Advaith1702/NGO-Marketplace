const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    ownerNgoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    category: {
      type: String,
      enum: ['food', 'clothing', 'medical', 'education', 'electronics', 'furniture', 'other'],
      default: 'other',
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['available', 'pending', 'claimed'],
      default: 'available',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Listing', listingSchema);
