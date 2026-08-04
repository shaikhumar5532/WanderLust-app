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

const locationCoordinates = {
    "Malibu": [-118.6923, 34.0259],
    "New York City": [-74.0060, 40.7128],
    "Aspen": [-106.8175, 39.1911],
    "Florence": [11.2558, 43.7696],
    "Portland": [-122.6784, 45.5152],
    "Cancun": [-86.8516, 21.1619],
    "Lake Tahoe": [-120.0324, 39.0968],
    "Los Angeles": [-118.2437, 34.0522],
    "Verbier": [7.2286, 46.0961],
    "Serengeti National Park": [34.8333, -2.15],
    "Amsterdam": [4.9041, 52.3676],
    "Fiji": [178.0650, -17.7134],
    "Cotswolds": [-1.7269, 51.9294],
    "Boston": [-71.0589, 42.3601],
    "Bali": [115.1889, -8.4095],
    "Banff": [-115.5708, 51.1784],
    "Miami": [-80.1918, 25.7617],
    "Phuket": [98.3922, 7.8804],
    "Scottish Highlands": [-4.2026, 57.4778],
    "Dubai": [55.2708, 25.2048],
    "Montana": [-110.3626, 46.8797],
    "Mykonos": [25.3676, 37.4467],
    "Costa Rica": [-83.7534, 9.7489],
    "Charleston": [-79.9311, 32.7765],
    "Tokyo": [139.6917, 35.6762],
    "New Hampshire": [-71.5724, 43.1939],
    "Maldives": [73.5089, 3.2028]
};

const initDB = async () => {
    await Listing.deleteMany({}); // Clear existing listings
    initData.data = initData.data.map((obj) => {
        const coords = locationCoordinates[obj.location] || [77.209, 28.6139];
        return {
            ...obj, 
            owner: "68da3746df626660cada3ac8",
            geometry: obj.geometry || { type: "Point", coordinates: coords }
        };
    });
    await Listing.insertMany(initData.data); // Insert initial data
    console.log("data was initialized");
}

initDB();