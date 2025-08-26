const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
});

const Listing = mongoose.model("Listing", listingSchema);  
module.exports = Listing;  