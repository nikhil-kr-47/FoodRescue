const express = require('express');
const router = express.Router();
const { Listing } = require('../models/Listing');

// GET /api/stats/impact
// Returns total meals delivered and summary counters
router.get('/impact', async (req, res) => {
  try {
    const deliveredListings = await Listing.find({ status: 'delivered' });
    const totalMealsDelivered = deliveredListings.reduce((sum, item) => sum + (item.quantity || 0), 0);

    const totalListings = await Listing.countDocuments();
    const openListings = await Listing.countDocuments({ status: 'open' });
    const activeRedistributions = await Listing.countDocuments({
      status: { $in: ['accepted', 'picked_up'] }
    });

    res.json({
      totalMealsDelivered,
      totalListings,
      openListings,
      activeRedistributions,
      deliveredCount: deliveredListings.length
    });
  } catch (error) {
    console.error('Impact stats error:', error);
    res.status(500).json({ error: 'Failed to fetch impact stats' });
  }
});

module.exports = router;
