# 🍲 FoodRescue (Shallow Prototype)

A lightweight surplus food redistribution web application prototype built with **React (Vite) + Tailwind CSS**, **Node.js + Express**, and **MongoDB (Mongoose)**.

This prototype demonstrates the core donation-to-delivery lifecycle:
1. **Donor**: Posts surplus food (with auto-calculated safe-until consumption limits).
2. **NGO**: Views matching open listings ranked by distance, capacity fit, and safe time margin, and accepts them.
3. **Volunteer**: Views accepted listings and transitions status from **"Picked up"** to **"Delivered"**.
4. **Impact Counter**: Live home page tracker showing total meals delivered (auto-polling every 5 seconds).

---

## 📁 Project Structure

```text
FoodRescue/
├── client/                     # Frontend (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthForm.jsx       # Login/Register with 1-click seed buttons
│   │   │   ├── CountdownTimer.jsx # Live countdown to safeUntil deadline
│   │   │   ├── DonorView.jsx      # Surplus food form & donor listing tracker
│   │   │   ├── ImpactCounter.jsx  # Live impact metrics & 5s auto-poll
│   │   │   ├── Navbar.jsx         # Navigation bar & quick role switcher
│   │   │   ├── NgoView.jsx        # Smart matching board & accept action
│   │   │   └── VolunteerView.jsx  # Dispatch task list & status actions
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Authentication & JWT state
│   │   ├── api.js                 # API helper
│   │   ├── App.jsx                # Main application component
│   │   ├── main.jsx               # React DOM entry
│   │   └── index.css              # Tailwind base styles
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend (Node.js + Express + Mongoose)
│   ├── models/
│   │   ├── User.js                # User schema (Donor, NGO, Volunteer)
│   │   └── Listing.js             # Listing schema & safe-until calculator
│   ├── middleware/
│   │   └── auth.js                # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js                # Register, Login, Me endpoints
│   │   ├── listings.js            # CRUD & smart matching NGO scoring
│   │   └── stats.js               # Impact counter endpoints
│   ├── seed.js                    # Database seeder (3 users + 3 listings)
│   ├── server.js                  # Express application setup
│   ├── .env                       # Environment configuration
│   └── package.json
│
└── README.md
```

---

## 👥 Seed Credentials (Preloaded)

You can log in directly using these accounts (or click the **Demo Quick-Log** buttons in the UI):

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Donor** | `donor@foodrescue.org` | `donor123` | *Green Dine Restaurant* (Roorkee) |
| **NGO** | `ngo@foodrescue.org` | `ngo123` | *Hope Care Foundation* (120 meals capacity) |
| **Volunteer** | `volunteer@foodrescue.org` | `vol123` | *Amit Sharma* (Rider / Dispatch) |

### Sample Preloaded Listings
1. **Open Listing**: Cooked rice, curries, dal (40 meals) — *Awaiting NGO match*
2. **Accepted Listing**: Bakery items (25 meals) — *Accepted by Hope Care Foundation*
3. **Delivered Listing**: Packaged food (50 meals) — *Delivered by volunteer (contributes to impact counter)*

---

## ⏱ Food Safety Rules (Hardcoded Table)

The system automatically calculates the `safeUntil` deadline at the time of posting:
- **Cooked rice, curries, dal**: `Cooked time + 4 hours`
- **Bakery items**: `Cooked time + 12 hours`
- **Packaged food**: `Cooked time + 48 hours`
- **Fried snacks & starters**: `Cooked time + 4 hours`
- **Dairy-based sweets**: `Cooked time + 6 hours`

---

## 🎯 NGO Smart Matching Algorithm

Open listings are sorted by a transparent weighted score:
$$\text{Score} = \text{DistanceScore} (50\%) + \text{CapacityFit} (30\%) + \text{TimeMargin} (20\%)$$
- **Distance**: Closer listings receive higher scores (within a 15 km radius).
- **Capacity**: Full 30-point bonus if NGO capacity $\ge$ listing quantity; partial score otherwise.
- **Time Feasibility**: Higher score if ample safe consumption time remains.

---

## 🚀 Quick Start & Run Steps

### Prerequisites
- Node.js (v18+)
- Local MongoDB running on `mongodb://127.0.0.1:27017`

### Step 1: Start MongoDB
Ensure MongoDB is running locally:
```bash
# MacOS (Homebrew)
brew services start mongodb-community
```

### Step 2: Set Up and Start Server
```bash
cd server
npm install

# Seed the 3 users and 3 sample listings:
npm run seed

# Start Express server (runs on port 5001):
npm start
```

### Step 3: Set Up and Start Client
Open a new terminal tab/window:
```bash
cd client
npm install

# Start Vite dev server (runs on port 5173):
npm run dev
```

Open **`http://localhost:5173`** in your browser!

---

## 🧪 Testing the 5-Step Prototype Flow

1. **View Home Page**: Note the **Live Redistribution Impact** counter showing 50 meals delivered.
2. **Log in as Donor**: Click "Demo Quick-Log: Donor". Fill out the food post form. Notice the auto-calculated safe-until preview (+4h for cooked food). Click **"Post Surplus Donation"**.
3. **Log in as NGO**: Click "Demo Quick-Log: NGO". The new listing appears at the top of the ranked list with distance, capacity fit, and safe-until countdown. Click **"✓ Accept Donation"**.
4. **Log in as Volunteer**: Click "Demo Quick-Log: Volunteer". The accepted donation appears in the active pickup list. Click **"📦 Mark Picked Up"**, then **"🏁 Mark Delivered"**.
5. **Return to Home**: Observe the **Total Meals Delivered** impact counter automatically incrementing without manual page reloads (via 5-second polling).
