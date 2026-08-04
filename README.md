# Wanderlust 🌍✈️

Wanderlust is a high-performance, masterfully designed, decoupled travel and accommodation booking web application. It allows users to browse unique stays, create new listings with image uploads, interact with beautiful, live Mapbox maps, write or delete reviews with star ratings, and seamlessly book their dream vacations.

Refactored from a monolithic Express/EJS setup, this architecture is fully decoupled into a **RESTful Express API backend** and a **modern React frontend** built with Vite. It incorporates industry-grade design semantics, glassmorphism aesthetics, responsive styling, and custom animations.

---

## 🌟 Key Features

### 🏨 Accommodation Listings (CRUD)
*   **Explore Stays**: Browse listings from all around the globe on a responsive grid display.
*   **Create & Edit Listings**: Full forms featuring input validation, autocomplete addresses, and multi-part image uploads directly to Cloudinary.
*   **Delete Listings**: Authorized users can remove their own listings, automatically cleaning up database records.
*   **Price and Tax Toggle**: An interactive utility bar that dynamically recalculates and displays the actual price of listings inclusive of an 18% GST (Tax) rate.
*   **Category Filters**: Instantly sort and view listings under trending themes (e.g., Rooms, Iconic Cities, Castles, Amazing Pools, Camping, Arctic, Farms).

### 📍 Interactive Location Geocoding
*   **Dynamic Maps**: Deep Mapbox GL integration that renders a detailed, responsive, interactive map on each listing's details page.
*   **Geocoding**: Listing addresses are automatically sent to the Mapbox Geocoding API on the backend to obtain precise latitude and longitude coordinate points.
*   **Visual Pins**: Renders high-quality customized markers on the map corresponding to the stay's geographical location.

### ✍️ Reviews and Star Ratings
*   **Review Management**: Add ratings and descriptive reviews to listings.
*   **Star Ratings**: Highly stylized review stars to grade your experiences.
*   **Author Controls**: Ensure users can only delete the reviews they wrote.

### 📅 Booking Engine
*   **Reserve Stays**: Check stay availability and calculate instant pricing summaries (base fare, service fees, and taxes).
*   **Personal Dashboard**: View all current active stays in a dedicated "My Bookings" user interface.
*   **Cancel Reservations**: Relinquish active bookings with an instantaneous, automated backend database update.

### 🔐 Secure Session & Auth System
*   **Robust Onboarding**: Highly secure signup and login flows utilizing `passport` and `passport-local`.
*   **State Recovery**: A `/current-user` backend checkpoint is accessed on page reload to instantly recover active client sessions.
*   **Secure Cookies**: Session-based credentials with CORS policies to safely run separate host origins.

---

## 🛠 Tech Stack

### Frontend Component
*   **Core Logic**: [React 19](https://react.dev/) (Vite-based build engine)
*   **Navigation & Routing**: [React Router DOM (v7)](https://reactrouter.com/)
*   **API Client**: [Axios](https://axios-http.com/) (configured with `withCredentials: true` to handle cross-origin session cookies)
*   **Geospatial UI**: [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/)
*   **Style Framework**: Vanilla CSS tailored with deep glassmorphism aesthetics, dynamic micro-interactions, responsive flex/grid wrappers, and custom-curated HSL palettes.
*   **Icons**: [React Icons](https://react-icons.github.io/react-icons/) (Lucide, Ion, FontAwesome varieties)

### Backend REST API Component
*   **Runtime Environment**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
*   **Database Management**: [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/)
*   **Authentication Middleware**: [Passport.js](https://www.passportjs.org/) & [passport-local-mongoose](https://github.com/saintedlema/passport-local-mongoose)
*   **Media Handling**: [Multer](https://github.com/expressjs/multer) & [Multer Storage Cloudinary](https://github.com/dzwood/multer-storage-cloudinary)
*   **Geocoding Integration**: [@mapbox/mapbox-sdk](https://github.com/mapbox/mapbox-sdk-node)
*   **Validation Engine**: [Joi](https://joi.dev/) (for schema verification of API inputs)

---

## 📂 Project Architecture

The project has been split into separate directories for clean decoupling:

```text
WanderLust-app/
├── backend/
│   ├── controllers/      # Route controllers (logic layer separated from routing)
│   │   ├── bookings.js
│   │   ├── listings.js
│   │   ├── reviews.js
│   │   └── users.js
│   ├── init/             # Sample database seed scripts & initialization
│   ├── models/           # Mongoose schemas & database blueprints
│   │   ├── booking.js
│   │   ├── listing.js
│   │   ├── review.js
│   │   └── user.js
│   ├── routes/           # REST API Route Declarations
│   │   ├── booking.js
│   │   ├── listing.js
│   │   ├── review.js
│   │   └── user.js
│   ├── utils/            # Custom utility error handlers & wrappers
│   ├── app.js            # Main Express server entry point
│   ├── cloudConfig.js    # Cloudinary upload configuration setup
│   ├── middleware.js     # Protected route validators (isLoggedIn, isOwner)
│   ├── schema.js         # Joi validation schemas
│   └── .env              # Server-side secrets & API keys
│
├── frontend/
│   ├── src/
│   │   ├── assets/       # Static assets, branding, and images
│   │   ├── components/   # Globally shared layout components
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/        # Main application screen views
│   │   │   ├── ListingsIndex.jsx
│   │   │   ├── ListingDetail.jsx
│   │   │   ├── CreateListing.jsx
│   │   │   ├── EditListing.jsx
│   │   │   ├── BookListing.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── App.css       # Layout styles
│   │   ├── index.css     # Curated global HSL design tokens and utility configurations
│   │   ├── App.jsx       # Main Client Router, Auth state, & Layout provider
│   │   └── main.jsx      # Client-side render entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
```

---

## 🚦 API Endpoints Reference

### 🚪 Authentication & Onboarding
*   `POST /signup` - Register a new user profile.
*   `POST /login` - Establish user session (local credentials).
*   `GET /logout` - Terminate session.
*   `GET /current-user` - Query the active session profile.

### 🏠 Listings API
*   `GET /listings` - Fetch all listed properties (supports query param/filtering).
*   `GET /listings/:id` - Fetch single stay details (populated with owner, reviews, and bookings).
*   `POST /listings` - Create a listing (requires login, supports multipart form data).
*   `PUT /listings/:id` - Edit listing details (requires login & ownership check).
*   `DELETE /listings/:id` - Remove listing (requires login & ownership check).

### ✍️ Reviews API
*   `POST /listings/:id/reviews` - Add a review with a rating (requires login).
*   `DELETE /listings/:id/reviews/:reviewId` - Remove review (requires login & review authorship).

### 📅 Bookings API
*   `GET /bookings` - Retrieve active user bookings list (requires login).
*   `POST /bookings/listings/:id` - Reserve stay for defined durations (requires login).
*   `DELETE /bookings/:id` - Cancel booking and clean database (requires login).

---

## ⚙️ Local Development & Setup

Follow these steps to configure the backend and frontend modules locally.

### 📋 Prerequisites
*   **Node.js**: Version `22.x` or later.
*   **MongoDB**: Local Community Server instance active OR a MongoDB Atlas deployment connection URI.
*   **Cloudinary Account**: Free-tier cloud setup to handle media and image storage.
*   **Mapbox Account**: Developer public access token to initialize dynamic Mapbox GL viewports.

---

### 1️⃣ Setting up the Backend REST API

1.  Navigate into the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure variables inside a `.env` file at the root of `backend/`:
    ```env
    # Cloudinary Config
    CLOUD_NAME=your_cloudinary_name
    CLOUD_API_KEY=your_cloudinary_api_key
    CLOUD_API_SECRET=your_cloudinary_api_secret

    # Mapbox Config
    MAP_TOKEN=your_mapbox_public_access_token

    # Database Config
    ATLASDB_URL=mongodb+srv://<username>:<password>@cluster0.your_db_url.mongodb.net/?appName=yourAppName
    SECRET=your_express_session_crypto_secret
    ```
    *Note: If the `ATLASDB_URL` is omitted, the application will automatically fall back to local Mongoose `mongodb://127.0.0.1:27017/wanderlust`.*

4.  Seed local database (Optional):
    ```bash
    node init/index.js
    ```
5.  Launch the backend server:
    ```bash
    node app.js
    ```
    *The server runs by default on `http://localhost:8080`.*

---

### 2️⃣ Setting up the React Frontend Client

1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a frontend environment file at `frontend/.env`:
    ```env
    VITE_API_URL=https://wanderlust-app-1-ctf3.onrender.com
    ```
    This tells the React app which backend URL to use. For local development, you can swap it back to `http://localhost:8080` if needed.
4.  Run the Vite development server:
    ```bash
    npm run dev
    ```
    *The client app launches at `http://localhost:5173`.*

### 3️⃣ Deploying the Frontend to Netlify

1. Build the frontend for production:
   ```bash
   cd frontend
   npm run build
   ```
2. In Netlify, create a new site from the `frontend` folder.
3. Set the build command to:
   ```bash
   npm run build
   ```
4. Set the publish directory to:
   ```bash
   dist
   ```
5. Ensure the frontend environment variable is configured in Netlify as:
   ```env
   VITE_API_URL=https://wanderlust-app-1-ctf3.onrender.com
   ```
6. Deploy the site.

---

## 🔒 Security & Optimization Features

*   **Graceful Database Fallback**: Custom retry handler inside `backend/app.js` catches initial connection issues (e.g., DNS, offline) and falls back dynamically to local database servers to avoid service crashes.
*   **Input Schema Sanitization**: Requests on listings, reviews, and bookings pass through Joi validation schemas to keep the database inputs strictly normalized.
*   **Dynamic UX**: Built-in CSS variables allow smooth HSL style updates, offering highly premium transitions, skeleton screens during page loads, and glassmorphic navigation panels.
