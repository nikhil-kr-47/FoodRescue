require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const statsRoutes = require('./routes/stats');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/foodrescue';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FoodRescue Prototype API', timestamp: new Date() });
});

// Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log(`Connected to MongoDB: ${MONGO_URI}`);

    // If database has 0 users, auto-run seed logic for zero-friction first deployment
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found in database. Automatically running initial seed...');
      const seedData = require('./seed');
      await seedData(false);
    }

    app.listen(PORT, () => {
      console.log(`FoodRescue Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
