const express = require('express');
const router = express.Router();
const { Listing, SAFE_WINDOW_TABLE } = require('../models/Listing');
const authMiddleware = require('../middleware/auth');

// Haversine formula to calculate distance in km between two lat/lng points
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 1.5; // fallback default
  }
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 1. Donor creates a surplus food listing
// POST /api/listings
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { foodType, quantity, isVeg, cookedAt, city, lat, lng } = req.body;

    if (!foodType || !quantity || !cookedAt) {
      return res.status(400).json({ error: 'Food type, quantity, and cooked time are required' });
    }

    const cookedDate = new Date(cookedAt);
    if (isNaN(cookedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid cooked time format' });
    }

    // Auto-calculate "safe until" using the hardcoded safety table
    const { safeUntil, hours } = Listing.calculateSafeUntil(foodType, cookedDate);

    const newListing = await Listing.create({
      donor: req.user.id,
      donorName: req.user.name,
      foodType,
      quantity: Number(quantity),
      isVeg: isVeg !== undefined ? isVeg : true,
      cookedAt: cookedDate,
      safeWindowHours: hours,
      safeUntil,
      city: city || req.user.city || 'Roorkee',
      lat: lat ? Number(lat) : req.user.lat || 29.8543,
      lng: lng ? Number(lng) : req.user.lng || 77.8880,
      status: 'open'
    });

    res.status(201).json({
      message: 'Surplus food listing created successfully',
      listing: newListing
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// 2. Donor view: get current donor's listings with status (open / accepted / delivered)
// GET /api/listings/my
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const listings = await Listing.find({ donor: req.user.id }).sort({ createdAt: -1 });
    res.json({ listings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your listings' });
  }
});

// 3. NGO view: list open listings sorted by simple score
// (closer distance = higher score, enough capacity = bonus)
// GET /api/listings/ngo
router.get('/ngo', authMiddleware, async (req, res) => {
  try {
    const ngoLat = req.user.lat || 29.8650;
    const ngoLng = req.user.lng || 77.8920;
    const ngoCapacity = req.user.capacity || 100;

    // Fetch open listings
    const openListings = await Listing.find({ status: 'open' }).lean();

    const scoredListings = openListings.map((item) => {
      const distance = calculateDistanceKm(ngoLat, ngoLng, item.lat, item.lng);

      // Distance score: closer distance gives higher score (up to 50 points)
      // Max radius considered: 15 km
      const distanceScore = Math.max(0, 50 * (1 - Math.min(distance, 15) / 15));

      // Capacity bonus: enough capacity gives full 30 bonus points
      let capacityBonus = 0;
      if (ngoCapacity >= item.quantity) {
        capacityBonus = 30;
      } else {
        capacityBonus = (ngoCapacity / item.quantity) * 30;
      }

      // Time feasibility bonus: more safe time left gives up to 20 points
      const now = new Date();
      const safeTimeLeftHours = (new Date(item.safeUntil) - now) / (1000 * 60 * 60);
      const timeScore = safeTimeLeftHours > 0 ? Math.min(20, safeTimeLeftHours * 5) : 0;

      const totalScore = Math.round(distanceScore + capacityBonus + timeScore);

      return {
        ...item,
        distanceKm: Number(distance.toFixed(1)),
        matchScore: totalScore,
        safeTimeLeftHours: Number(safeTimeLeftHours.toFixed(1))
      };
    });

    // Sort descending by score
    scoredListings.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ listings: scoredListings });
  } catch (error) {
    console.error('Fetch NGO listings error:', error);
    res.status(500).json({ error: 'Failed to fetch NGO listings' });
  }
});

// Accept a listing (NGO action)
// PATCH /api/listings/:id/accept
router.patch('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.status !== 'open') {
      return res.status(400).json({ error: `Cannot accept listing in '${listing.status}' status` });
    }

    listing.status = 'accepted';
    listing.acceptedByNgo = req.user.id;
    listing.ngoName = req.user.name;
    await listing.save();

    res.json({
      message: 'Listing accepted successfully by NGO',
      listing
    });
  } catch (error) {
    console.error('Accept listing error:', error);
    res.status(500).json({ error: 'Failed to accept listing' });
  }
});

// 4. Volunteer view: list accepted listings ready for pickup/delivery
// GET /api/listings/volunteer
router.get('/volunteer', authMiddleware, async (req, res) => {
  try {
    // Show accepted and picked_up listings (as well as recently delivered)
    const listings = await Listing.find({
      status: { $in: ['accepted', 'picked_up', 'delivered'] }
    }).sort({ updatedAt: -1 });

    res.json({ listings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch volunteer tasks' });
  }
});

// Volunteer status updates: "picked_up" and "delivered"
// PATCH /api/listings/:id/status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['picked_up', 'delivered'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be picked_up or delivered.' });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    listing.status = status;
    listing.volunteer = req.user.id;
    listing.volunteerName = req.user.name;
    await listing.save();

    res.json({
      message: `Status updated to ${status}`,
      listing
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update listing status' });
  }
});

// Get safety table config
router.get('/safety-table', (req, res) => {
  res.json({ safetyTable: SAFE_WINDOW_TABLE });
});

module.exports = router;
