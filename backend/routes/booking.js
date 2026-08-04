const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const bookingsController = require("../controllers/bookings");

// GET all user bookings
router.get("/", isLoggedIn, wrapAsync(bookingsController.getUserBookings));

// POST new booking for a specific listing
router.post("/listings/:id", isLoggedIn, wrapAsync(bookingsController.createBooking));

// DELETE/Cancel a booking
router.delete("/:id", isLoggedIn, wrapAsync(bookingsController.cancelBooking));

module.exports = router;
