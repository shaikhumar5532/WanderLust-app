const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js"); //importing the Listing model

const MONGO_URI = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("Connected to DB");
    }).catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URI);
} 

const initDB = async () => {
    await Listing.deleteMany({}); // Clear existing listings
    await Listing.insertMany(initData.data); // Insert initial data
    console.log("Database initialized with sample data");
}

initDB();