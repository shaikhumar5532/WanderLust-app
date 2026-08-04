const Booking = require("../models/booking");
const Listing = require("../models/listing");

module.exports.createBooking = async (req, res, next) => {
    try {
        const { id } = req.params; // listing id
        const { checkIn, checkOut, guests, totalPrice } = req.body;
        
        const newBooking = new Booking({
            listing: id,
            user: req.user._id,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            guests: parseInt(guests),
            totalPrice: parseFloat(totalPrice)
        });

        await newBooking.save();
        res.status(201).json({ message: "Booking confirmed successfully!", booking: newBooking });
    } catch (err) {
        next(err);
    }
};

module.exports.getUserBookings = async (req, res, next) => {
    try {
        // Fetch all bookings for the currently authenticated user
        const bookings = await Booking.find({ user: req.user._id })
            .populate("listing")
            .sort({ createdAt: -1 });
        
        res.json(bookings);
    } catch (err) {
        next(err);
    }
};

module.exports.cancelBooking = async (req, res, next) => {
    try {
        const { id } = req.params; // booking id
        
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found." });
        }

        // Authorization check: Make sure user owns the booking!
        if (!booking.user.equals(req.user._id)) {
            return res.status(403).json({ error: "You are not authorized to cancel this booking." });
        }

        await Booking.findByIdAndDelete(id);
        res.json({ message: "Booking cancelled successfully!" });
    } catch (err) {
        next(err);
    }
};
