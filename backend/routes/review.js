const express =require("express");
const router = express.Router({ mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

const reviewsController = require("../controllers/reviews.js");
const reviews = require("../models/review.js");

//Post Review Route
router.post(
    "/", 
    isLoggedIn,
    validateReview, 
    wrapAsync(reviewsController.createReview)
);

//Delete Review Route
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewsController.destroyReview)
)

module.exports = router;
