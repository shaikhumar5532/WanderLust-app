# Implementation Plan - Convert Wanderlust to decoupled React Frontend + Express Backend

We will migrate the current server-side rendered (EJS) Express application into a decoupled architecture:
1. **Express Backend (`/backend`)**: Refactored to act strictly as a REST API, sending and receiving JSON, and handling authentication over session cookies with credentials (CORS).
2. **React Frontend (`/frontend`)**: Built from scratch using Vite, React, and custom styling. It will have a highly premium, modern, responsive UI with animations, custom interactive elements, and robust state management.

---

## User Review Required

> [!IMPORTANT]
> **Authentication Mechanism**
> We will preserve the existing Passport-local session-based authentication to avoid major database schema migrations. The frontend will communicate with credentials (`withCredentials: true`), allowing the session cookie to be set and sent on every API call.
>
> **Mapbox Integration**
> We will implement the interactive Mapbox map in React using the standard `mapbox-gl` package directly, fetching coords from the backend REST endpoint. Please ensure your `MAP_TOKEN` in the `.env` file is valid!

---

## Proposed Changes

We will split the workspace into two top-level directories: `backend` and `frontend`.

### 1. Backend Restructuring & API Conversion (`/backend`)

We will move the current codebase into a new `backend/` folder and transform it into a JSON REST API. All EJS template rendering and EJS-based redirects will be replaced with JSON responses.

#### [NEW] [backend/package.json](file:///d:/Project/AppColl/project/backend/package.json)
We will define the backend dependencies, including `cors` (configured with `credentials: true` and `origin: ["http://localhost:5173"]`).

#### [MODIFY] [backend/app.js](file:///d:/Project/AppColl/project/backend/app.js)
- Remove EJS engine configuration.
- Add and configure `cors` middleware for cookies (`origin: "http://localhost:5173"`, `credentials: true`).
- Ensure `express.json()` and `express.urlencoded({ extended: true })` are registered.
- Change EJS error render to JSON error response (`res.status(statusCode).json({ error: message })`).

#### [MODIFY] [backend/middleware.js](file:///d:/Project/AppColl/project/backend/middleware.js)
- Refactor `isLoggedIn` to return `res.status(401).json({ error: "You must be logged in to do that!" })`.
- Refactor `isOwner` to return `res.status(403).json({ error: "You are not authorized! You do not own this listing." })`.
- Refactor `isReviewAuthor` to return `res.status(403).json({ error: "You are not authorized! You did not write this review." })`.

#### [MODIFY] [backend/controllers/listings.js](file:///d:/Project/AppColl/project/backend/controllers/listings.js)
- Change `index` to return `res.json(allListings)`.
- Change `showListing` to return `res.json(listing)`.
- Change `createListing` to return JSON of the saved listing.
- Change `updateListing` to return JSON of the updated listing.
- Change `destroyListing` to return JSON with a success message.
- Remove view form renders (`renderNewForm`, `renderEditForm`).

#### [MODIFY] [backend/controllers/reviews.js](file:///d:/Project/AppColl/project/backend/controllers/reviews.js)
- Change `createReview` to return JSON of the created review.
- Change `destroyReview` to return JSON with a success message.

#### [MODIFY] [backend/controllers/users.js](file:///d:/Project/AppColl/project/backend/controllers/users.js)
- Refactor `signup` to log in the user using `req.login` and return JSON of the user profile.
- Refactor `login` to return JSON of the logged-in user profile.
- Refactor `logout` to return JSON with a success message.
- Remove EJS form renders (`renderSignupForm`, `renderLoginForm`).

#### [MODIFY] [backend/routes/user.js](file:///d:/Project/AppColl/project/backend/routes/user.js)
- Modify `/login` route to use a custom Passport authenticate handler so that it returns clean JSON error messages if credentials fail (instead of standard redirects).
- Add a new GET `/current-user` route to let the React frontend query the session user's state.

---

### 2. Frontend Creation (`/frontend`)

We will create a clean React app in `/frontend` using Vite.

#### [NEW] [frontend/src/index.css](file:///d:/Project/AppColl/project/frontend/src/index.css)
A custom-tailored CSS utility system containing glassmorphism classes, modern typography imports (Inter/Outfit), HSL custom color properties, gradient transitions, responsive grids, and micro-animations.

#### [NEW] [frontend/src/App.jsx](file:///d:/Project/AppColl/project/frontend/src/App.jsx)
Main routing setup using React Router DOM, serving routes for:
- Home / Listings Index (`/`)
- Listing Details (`/listings/:id`)
- Create Listing (`/listings/new`)
- Edit Listing (`/listings/:id/edit`)
- Login (`/login`)
- Signup (`/signup`)

#### [NEW] [frontend/src/components/Navbar.jsx](file:///d:/Project/AppColl/project/frontend/src/components/Navbar.jsx)
A gorgeous navigation bar with active state routes, search bar, interactive dropdowns, profile status, and a responsive toggle menu.

#### [NEW] [frontend/src/components/Footer.jsx](file:///d:/Project/AppColl/project/frontend/src/components/Footer.jsx)
A sleek, minimalistic dark footer detailing social links, copyrights, and branding.

#### [NEW] [frontend/src/pages/ListingsIndex.jsx](file:///d:/Project/AppColl/project/frontend/src/pages/ListingsIndex.jsx)
A premium dashboard exhibiting category filters (e.g. Trend, Rooms, Iconic Cities, Castles, Camping) with neat icons, followed by a responsive grid of card listings showing hover-effects, pricing details, and tax-toggle capabilities.

#### [NEW] [frontend/src/pages/ListingDetail.jsx](file:///d:/Project/AppColl/project/frontend/src/pages/ListingDetail.jsx)
A masterfully designed details view:
- Rich photo layout with image actions.
- Interactive map container powered by Mapbox GL.
- Star ratings and reviews list.
- Dynamic "Add a Review" interactive form.
- Direct listing action tools (Edit/Delete) if the logged-in user is the owner.

#### [NEW] [frontend/src/pages/CreateListing.jsx](file:///d:/Project/AppColl/project/frontend/src/pages/CreateListing.jsx) & [frontend/src/pages/EditListing.jsx](file:///d:/Project/AppColl/project/frontend/src/pages/EditListing.jsx)
Dynamic form components utilizing standard React controlled state. Handles standard fields + cloud-based image file uploading using multipart/form-data.

#### [NEW] [frontend/src/pages/Login.jsx](file:///d:/Project/AppColl/project/frontend/src/pages/Login.jsx) & [frontend/src/pages/Signup.jsx](file:///d:/Project/AppColl/project/frontend/src/pages/Signup.jsx)
Aesthetically stunning user onboarding forms with animations, field validations, and error display boxes.

---

## Verification Plan

### Automated/Local Setup
1. Spin up the Express backend in the backend folder: `node app.js` (running on `localhost:8080`).
2. Spin up the React frontend via Vite in the frontend folder: `npm run dev` (running on `localhost:5173`).

### Manual Verification
- **Browse Listings**: Navigate listings page, toggle taxes, filter categories.
- **Detailed View**: Open a listing, check if reviews and Mapbox map render correctly.
- **Create/Update**: Test form submissions, uploading a mock image and verifying geocoding coordinates save in DB and plot on Mapbox.
- **Auth Flow**: Perform signup, login, and logout. Ensure listing actions are authorized/hidden correctly based on own/guest session states.
- **Error Handling**: Try accessing protected actions (like editing someone else's listing) and verify correct JSON error display.
