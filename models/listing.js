const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },   
    description: String,
    image:  {
        type: String,
        default:
            "https://unsplash.com/photos/brown-nipa-hut-on-white-sand-beach-during-daytime-4aqH2utAPAs",
        set: (v) =>
            v ==="" 
                ? "https://unsplash.com/photos/brown-nipa-hut-on-white-sand-beach-during-daytime-4aqH2utAPAs"
                : v,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing) {
       await Review.deleteMany({reviews : {_id: listing.reviews} }); 
    }   
})

const Listing = mongoose.model("Listing", listingSchema);  
module.exports = Listing;  