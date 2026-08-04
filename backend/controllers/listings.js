const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.json(allListings);
}

module.exports.renderNewForm = (req, res) => {
    res.json({ message: "New form rendered by frontend" });
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    if (!listing) {
        return res.status(404).json({ error: "Listing you requested for does not exist" });
    }
    
    // Convert to plain object and append Mapbox Access Token dynamically!
    const listingData = listing.toObject();
    listingData.mapToken = process.env.MAP_TOKEN;
    
    res.json(listingData);
}

module.exports.createListing = async (req, res, next) => {
    try {
        let listingData = req.body.listing;
        if (typeof listingData === "string") {
            listingData = JSON.parse(listingData);
        } else if (!listingData) {
            listingData = {
                title: req.body.title,
                description: req.body.description,
                price: req.body.price,
                location: req.body.location,
                country: req.body.country
            };
        }

        let response = await geocodingClient
            .forwardGeocode({
                query: listingData.location || req.body.location,
                limit: 1,
            })
            .send();
        
        let url = req.file ? req.file.path : "";
        let filename = req.file ? req.file.filename : "";
        
        const newListing = new Listing(listingData);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };

        if (response.body.features && response.body.features.length > 0) {
            newListing.geometry = response.body.features[0].geometry;
        } else {
            newListing.geometry = { type: "Point", coordinates: [0, 0] };
        }

        let savedListing = await newListing.save();
        res.status(201).json({ message: "New Listing Created!", listing: savedListing });
    } catch (err) {
        next(err);
    }
}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return res.status(404).json({ error: "Listing you requested for does not exist" });
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.json({ listing, originalImageUrl });
}

module.exports.updateListing = async (req, res, next) => {
    try {
        let { id } = req.params;
        let listingData = req.body.listing;
        if (typeof listingData === "string") {
            listingData = JSON.parse(listingData);
        } else if (!listingData) {
            listingData = {
                title: req.body.title,
                description: req.body.description,
                price: req.body.price,
                location: req.body.location,
                country: req.body.country
            };
        }

        let listing = await Listing.findByIdAndUpdate(id, listingData, { new: true });

        if (req.file) {
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = { url, filename };
            await listing.save();
        }
        res.json({ message: "Listing Updated!", listing });
    } catch (err) {
        next(err);
    }
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    res.json({ message: "Listing Deleted!", deletedListing });
}