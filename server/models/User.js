const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['Donor', 'NGO', 'Volunteer'],
      required: true,
      default: 'Donor'
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
    // Useful for NGOs to calculate capacity fit bonus
    capacity: {
      type: Number,
      default: 100
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
