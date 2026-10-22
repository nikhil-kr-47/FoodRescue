// In-browser mock store for zero-friction demoing on Vercel
// When Render backend is asleep, down, or not configured, this handles all requests seamlessly in localStorage.

const DEFAULT_USERS = [
  {
    id: 'donor_seed_1',
    name: 'Green Dine Restaurant',
    email: 'donor@foodrescue.org',
    role: 'Donor',
    city: 'Roorkee',
    lat: 29.8543,
    lng: 77.8880
  },
  {
    id: 'ngo_seed_2',
    name: 'Hope Care Foundation',
    email: 'ngo@foodrescue.org',
    role: 'NGO',
    city: 'Roorkee',
    lat: 29.8650,
    lng: 77.8920,
    capacity: 120
  },
  {
    id: 'vol_seed_3',
    name: 'Amit Sharma',
    email: 'volunteer@foodrescue.org',
    role: 'Volunteer',
    city: 'Roorkee',
    lat: 29.8600,
    lng: 77.8900
  }
];

const DEFAULT_LISTINGS = [
  {
    _id: 'mock_listing_1',
    donor: 'donor_seed_1',
    donorName: 'Green Dine Restaurant',
    foodType: 'Cooked rice, curries, dal',
    quantity: 40,
    isVeg: true,
    cookedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    safeWindowHours: 4,
    safeUntil: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    city: 'Roorkee',
    lat: 29.8543,
    lng: 77.8880,
    status: 'open'
  },
  {
    _id: 'mock_listing_2',
    donor: 'donor_seed_1',
    donorName: 'Green Dine Restaurant',
    foodType: 'Bakery items',
    quantity: 25,
    isVeg: true,
    cookedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    safeWindowHours: 12,
    safeUntil: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
    city: 'Roorkee',
    lat: 29.8543,
    lng: 77.8880,
    status: 'accepted',
    acceptedByNgo: 'ngo_seed_2',
    ngoName: 'Hope Care Foundation'
  },
  {
    _id: 'mock_listing_3',
    donor: 'donor_seed_1',
    donorName: 'Green Dine Restaurant',
    foodType: 'Packaged food',
    quantity: 50,
    isVeg: true,
    cookedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    safeWindowHours: 48,
    safeUntil: new Date(Date.now() + 42 * 60 * 60 * 1000).toISOString(),
    city: 'Roorkee',
    lat: 29.8543,
    lng: 77.8880,
    status: 'delivered',
    acceptedByNgo: 'ngo_seed_2',
    ngoName: 'Hope Care Foundation',
    volunteer: 'vol_seed_3',
    volunteerName: 'Amit Sharma'
  }
];

function getStoredListings() {
  const data = localStorage.getItem('foodrescue_mock_listings');
  if (!data) {
    localStorage.setItem('foodrescue_mock_listings', JSON.stringify(DEFAULT_LISTINGS));
    return DEFAULT_LISTINGS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_LISTINGS;
  }
}

function saveStoredListings(listings) {
  localStorage.setItem('foodrescue_mock_listings', JSON.stringify(listings));
}

// Haversine formula
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return 1.5;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const SAFE_WINDOW_TABLE = {
  'Cooked rice, curries, dal': 4,
  'Bakery items': 12,
  'Packaged food': 48,
  'Fried snacks and starters': 4,
  'Dairy-based sweets': 6
};

// Mock request dispatcher
export function handleMockRequest(endpoint, method, body, currentUser) {
  // 1. Auth Login
  if (endpoint === '/auth/login' && method === 'POST') {
    const user = DEFAULT_USERS.find((u) => u.email.toLowerCase() === body.email.toLowerCase()) || {
      id: 'custom_user_' + Date.now(),
      name: body.email.split('@')[0],
      email: body.email,
      role: 'Donor',
      city: 'Roorkee',
      lat: 29.8543,
      lng: 77.8880
    };
    return {
      message: 'Login successful (Demo Mode)',
      token: 'mock_jwt_token_' + user.id,
      user
    };
  }

  // 2. Auth Register
  if (endpoint === '/auth/register' && method === 'POST') {
    const newUser = {
      id: 'custom_user_' + Date.now(),
      name: body.name,
      email: body.email,
      role: body.role,
      city: body.city || 'Roorkee',
      capacity: Number(body.capacity || 100),
      lat: 29.8543,
      lng: 77.8880
    };
    return {
      message: 'Registration successful (Demo Mode)',
      token: 'mock_jwt_token_' + newUser.id,
      user: newUser
    };
  }

  // 3. Auth Me
  if (endpoint === '/auth/me' && method === 'GET') {
    return { user: currentUser || DEFAULT_USERS[0] };
  }

  // 4. Stats Impact
  if (endpoint === '/stats/impact') {
    const listings = getStoredListings();
    const delivered = listings.filter((l) => l.status === 'delivered');
    const totalMealsDelivered = delivered.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const openListings = listings.filter((l) => l.status === 'open').length;
    const activeRedistributions = listings.filter((l) => ['accepted', 'picked_up'].includes(l.status)).length;
    return {
      totalMealsDelivered,
      totalListings: listings.length,
      openListings,
      activeRedistributions,
      deliveredCount: delivered.length
    };
  }

  // 5. Post Listing
  if (endpoint === '/listings' && method === 'POST') {
    const hours = SAFE_WINDOW_TABLE[body.foodType] || 4;
    const cookedDate = new Date(body.cookedAt);
    const safeUntil = new Date(cookedDate.getTime() + hours * 60 * 60 * 1000).toISOString();

    const newListing = {
      _id: 'mock_listing_' + Date.now(),
      donor: currentUser?.id || 'donor_seed_1',
      donorName: currentUser?.name || 'Green Dine Restaurant',
      foodType: body.foodType,
      quantity: Number(body.quantity),
      isVeg: body.isVeg !== undefined ? body.isVeg : true,
      cookedAt: cookedDate.toISOString(),
      safeWindowHours: hours,
      safeUntil,
      city: body.city || 'Roorkee',
      lat: body.lat ? Number(body.lat) : 29.8543,
      lng: body.lng ? Number(body.lng) : 77.8880,
      status: 'open'
    };

    const listings = getStoredListings();
    listings.unshift(newListing);
    saveStoredListings(listings);

    return { message: 'Listing created successfully', listing: newListing };
  }

  // 6. Donor Listings
  if (endpoint === '/listings/my' && method === 'GET') {
    const listings = getStoredListings();
    return { listings };
  }

  // 7. NGO Scored Listings
  if (endpoint === '/listings/ngo' && method === 'GET') {
    const listings = getStoredListings();
    const open = listings.filter((l) => l.status === 'open');

    const ngoLat = currentUser?.lat || 29.8650;
    const ngoLng = currentUser?.lng || 77.8920;
    const ngoCapacity = currentUser?.capacity || 120;

    const scored = open.map((item) => {
      const distance = calculateDistanceKm(ngoLat, ngoLng, item.lat, item.lng);
      const distanceScore = Math.max(0, 50 * (1 - Math.min(distance, 15) / 15));
      const capacityBonus = ngoCapacity >= item.quantity ? 30 : (ngoCapacity / item.quantity) * 30;
      const timeLeft = (new Date(item.safeUntil) - new Date()) / (1000 * 60 * 60);
      const timeScore = timeLeft > 0 ? Math.min(20, timeLeft * 5) : 0;
      const totalScore = Math.round(distanceScore + capacityBonus + timeScore);

      return {
        ...item,
        distanceKm: Number(distance.toFixed(1)),
        matchScore: totalScore,
        safeTimeLeftHours: Number(timeLeft.toFixed(1))
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    return { listings: scored };
  }

  // 8. Accept Listing
  if (endpoint.startsWith('/listings/') && endpoint.endsWith('/accept') && method === 'PATCH') {
    const id = endpoint.split('/')[2];
    const listings = getStoredListings();
    const item = listings.find((l) => l._id === id);
    if (item) {
      item.status = 'accepted';
      item.acceptedByNgo = currentUser?.id || 'ngo_seed_2';
      item.ngoName = currentUser?.name || 'Hope Care Foundation';
      saveStoredListings(listings);
    }
    return { message: 'Listing accepted', listing: item };
  }

  // 9. Volunteer Listings
  if (endpoint === '/listings/volunteer' && method === 'GET') {
    const listings = getStoredListings();
    const volTasks = listings.filter((l) => ['accepted', 'picked_up', 'delivered'].includes(l.status));
    return { listings: volTasks };
  }

  // 10. Update Status
  if (endpoint.startsWith('/listings/') && endpoint.endsWith('/status') && method === 'PATCH') {
    const id = endpoint.split('/')[2];
    const listings = getStoredListings();
    const item = listings.find((l) => l._id === id);
    if (item) {
      item.status = body.status;
      item.volunteer = currentUser?.id || 'vol_seed_3';
      item.volunteerName = currentUser?.name || 'Amit Sharma';
      saveStoredListings(listings);
    }
    return { message: `Status updated to ${body.status}`, listing: item };
  }

  return {};
}
