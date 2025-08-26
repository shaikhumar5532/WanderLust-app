const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");  //importing the Listing model
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const cors = require("cors");  //connet http request from hoppscotch
const {listingSchema} = require("./schema.js");

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

app.set("view engine", "ejs");  
app.set("views", path.join(__dirname, "views")); 
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));   
app.engine("ejs", ejsMate);  
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());  //to avoid cors error while connecting from hoppscotch


app.get("/", (req, res) => {
    res.send("Hi, I am root");
}); 

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body); 
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

//index route
app.get("/listings", wrapAsync(async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings}); 
}));

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//Show route
app.get("/listings/:id", wrapAsync(async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    res.render("listings/show.ejs", {listing});
}));

//Create route
app.post(
    "/listings",
    validateListing, 
    wrapAsync(async (req, res, next) => {
      const newListing = new Listing(req.body.listing);
      await newListing.save();
      res.redirect("/listings");
    })
);

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put(
    "/listings/:id", 
    validateListing,
    wrapAsync(async(req, res) => {
      let {id} = req.params;
      await Listing.findByIdAndUpdate(id, {...req.body.listing});
      res.redirect(`/listings/${id}`);
    })
);

//Delete Route
app.delete("/listings/:id", wrapAsync(async(req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

//This route is used for testing purposes.
// app.get("/testListing", async (req, res) => {  //new route to test listing model
//     let sampleListing = new Listing({   //Creates a new Listing object with sample data:
//         title: "My new Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India"
//     });

//     await sampleListing.save(); //saving the sample listing to the database
//     console.log("Sample listing saved"); // after saving the sample listing, we will log a message 
//     res.send("Sample listing created and saved to the database"); // sending a response to the client
// })

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", {message});
    // res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});