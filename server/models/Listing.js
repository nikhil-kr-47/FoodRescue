const mongoose = require('mongoose');

// Safe window rules (in hours) as specified in the project specs:
// - cooked rice/curry: 4h
// - bakery: 12h
// - packaged: 48h
// - default fallback: 4h
const SAFE_WINDOW_TABLE = {
  'Cooked rice, curries, dal': 4,
  'Bakery items': 12,
  'Packaged food': 48,
  'Fried snacks and starters': 4,
  'Dairy-based sweets': 6,
  'Fruits and raw vegetables': 24
};

const ListingSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    donorName: {
      type: String,
      required: true
    },
    foodType: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    isVeg: {
      type: Boolean,
      default: true
    },
    cookedAt: {
      type: Date,
      required: true
    },
    safeWindowHours: {
      type: Number,
      default: 4
    },
    safeUntil: {
      type: Date,
      required: true
    },
    city: {
      type: String,
      default: 'Roorkee'
    },
    lat: {
      type: Number,
      default: 29.8543
    },
    lng: {
      type: Number,
      default: 77.8880
    },
    status: {
      type: String,
      enum: ['open', 'accepted', 'picked_up', 'delivered'],
      default: 'open'
    },
    acceptedByNgo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ngoName: {
      type: String
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    volunteerName: {
      type: String
    }
  },
  { timestamps: true }
);

// Helper function to calculate safe-until from food type and cookedAt time
ListingSchema.statics.calculateSafeUntil = function (foodType, cookedAtDate) {
  const hours = SAFE_WINDOW_TABLE[foodType] || 4;
  const safeUntil = new Date(cookedAtDate.getTime() + hours * 60 * 60 * 1000);
  return { safeUntil, hours };
};

module.exports = {
  Listing: mongoose.model('Listing', ListingSchema),
  SAFE_WINDOW_TABLE
};
