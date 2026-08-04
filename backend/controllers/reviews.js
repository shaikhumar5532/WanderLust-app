const Listing = require("../models/listing");
const Review = require("../models/review.js");

module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let reviewData = req.body.review;
    if (typeof reviewData === "string") {
        reviewData = JSON.parse(reviewData);
    } else if (!reviewData) {
        reviewData = {
            comment: req.body.comment,
            rating: req.body.rating
        };
    }
    let newReview = new Review(reviewData);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    
    await newReview.populate("author");
    
    res.status(201).json({ message: "New Review Created!", review: newReview });
}

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.json({ message: "Review Deleted!" });
}