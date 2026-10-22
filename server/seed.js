require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { Listing, SAFE_WINDOW_TABLE } = require('./models/Listing');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/foodrescue';

async function seedData(shouldExit = true) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
      console.log('Connected to MongoDB for seeding...');
    }

    // Clear existing collections
    await User.deleteMany({});
    await Listing.deleteMany({});
    console.log('Existing users and listings cleared.');

    // Create 3 seed users (1 per role)
    const donorPass = await bcrypt.hash('donor123', 10);
    const ngoPass = await bcrypt.hash('ngo123', 10);
    const volPass = await bcrypt.hash('vol123', 10);

    const donorUser = await User.create({
      name: 'Green Dine Restaurant',
      email: 'donor@foodrescue.org',
      password: donorPass,
      role: 'Donor',
      city: 'Roorkee',
      lat: 29.8543,
      lng: 77.8880
    });

    const ngoUser = await User.create({
      name: 'Hope Care Foundation',
      email: 'ngo@foodrescue.org',
      password: ngoPass,
      role: 'NGO',
      city: 'Roorkee',
      lat: 29.8650,
      lng: 77.8920,
      capacity: 120 // can handle 120 meals
    });

    const volunteerUser = await User.create({
      name: 'Amit Sharma',
      email: 'volunteer@foodrescue.org',
      password: volPass,
      role: 'Volunteer',
      city: 'Roorkee',
      lat: 29.8600,
      lng: 77.8900
    });

    console.log('Created 3 Seed Users:');
    console.log('1. Donor: donor@foodrescue.org / donor123');
    console.log('2. NGO: ngo@foodrescue.org / ngo123');
    console.log('3. Volunteer: volunteer@foodrescue.org / vol123');

    // Create 3 Sample Listings
    const now = new Date();

    // Listing 1: Open listing (Cooked rice & curries, cooked 1 hour ago)
    const cooked1 = new Date(now.getTime() - 1 * 60 * 60 * 1000);
    const safe1 = new Date(cooked1.getTime() + 4 * 60 * 60 * 1000);
    const listing1 = await Listing.create({
      donor: donorUser._id,
      donorName: donorUser.name,
      foodType: 'Cooked rice, curries, dal',
      quantity: 40,
      isVeg: true,
      cookedAt: cooked1,
      safeWindowHours: 4,
      safeUntil: safe1,
      city: 'Roorkee',
      lat: 29.8543,
      lng: 77.8880,
      status: 'open'
    });

    // Listing 2: Accepted listing (Fresh Bakery items, accepted by NGO)
    const cooked2 = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const safe2 = new Date(cooked2.getTime() + 12 * 60 * 60 * 1000);
    const listing2 = await Listing.create({
      donor: donorUser._id,
      donorName: donorUser.name,
      foodType: 'Bakery items',
      quantity: 25,
      isVeg: true,
      cookedAt: cooked2,
      safeWindowHours: 12,
      safeUntil: safe2,
      city: 'Roorkee',
      lat: 29.8543,
      lng: 77.8880,
      status: 'accepted',
      acceptedByNgo: ngoUser._id,
      ngoName: ngoUser.name
    });

    // Listing 3: Delivered listing (Packaged meals, picked up and delivered)
    const cooked3 = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    const safe3 = new Date(cooked3.getTime() + 48 * 60 * 60 * 1000);
    const listing3 = await Listing.create({
      donor: donorUser._id,
      donorName: donorUser.name,
      foodType: 'Packaged food',
      quantity: 50,
      isVeg: true,
      cookedAt: cooked3,
      safeWindowHours: 48,
      safeUntil: safe3,
      city: 'Roorkee',
      lat: 29.8543,
      lng: 77.8880,
      status: 'delivered',
      acceptedByNgo: ngoUser._id,
      ngoName: ngoUser.name,
      volunteer: volunteerUser._id,
      volunteerName: volunteerUser.name
    });

    console.log('Created 3 Sample Listings:');
    console.log(`- Listing 1 (Open): ${listing1.foodType} (${listing1.quantity} meals)`);
    console.log(`- Listing 2 (Accepted): ${listing2.foodType} (${listing2.quantity} meals)`);
    console.log(`- Listing 3 (Delivered): ${listing3.foodType} (${listing3.quantity} meals)`);

    console.log('Seeding completed successfully!');
    if (shouldExit) process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    if (shouldExit) process.exit(1);
    throw error;
  }
}

if (require.main === module) {
  seedData(true);
}

module.exports = seedData;
