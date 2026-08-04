process.on("uncaughtException", (err) => {
    console.log("------------------------------------------------------------------");
    console.log("ASYNC PROCESS EXCEPTION PREVENTED:", err.message);
    console.log("------------------------------------------------------------------");
});

process.on("unhandledRejection", (err) => {
    console.log("------------------------------------------------------------------");
    console.log("ASYNC PROMISE REJECTION PREVENTED:", err.message);
    console.log("------------------------------------------------------------------");
});

if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const cors = require("cors");  //connet http request from hoppscotch
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash")
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js"); 


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");

const dbURL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function connectDB() {
    try {
        console.log("Connecting to Atlas MongoDB...");
        // Set a timeout of 5 seconds so it doesn't hang forever if offline
        const conn = await mongoose.connect(dbURL, { serverSelectionTimeoutMS: 5000 });
        console.log("Connected to Atlas MongoDB successfully!");
        return conn;
    } catch (err) {
        console.log("------------------------------------------------------------------");
        console.log("ATLAS DATABASE CONNECTION FAILED:", err.message);
        console.log("------------------------------------------------------------------");
        console.log("This is usually caused by: ");
        console.log("1. Being offline or having an unstable internet connection.");
        console.log("2. Your local DNS blocking MongoDB SRV queries (common with some ISPs).");
        console.log("   --> Fix: Try changing your network DNS to Google DNS (8.8.8.8 and 8.8.4.4).");
        console.log("3. An expired or invalid ATLASDB_URL in your backend/.env file.");
        console.log("------------------------------------------------------------------");
        
        const localDB = "mongodb://127.0.0.1:27017/wanderlust";
        console.log(`Gracefully falling back to local database: ${localDB}`);
        console.log("Please make sure MongoDB is running locally on your machine!");
        console.log("------------------------------------------------------------------");
        
        try {
            // Crucial: Disconnect the failed connection to reset default connection state!
            await mongoose.disconnect();
            
            // Connect to local database cleanly
            const conn = await mongoose.connect(localDB);
            console.log("Connected to Local MongoDB successfully!");
            return conn;
        } catch (localErr) {
            console.log("Local MongoDB connection also failed:", localErr.message);
            console.log("Please start MongoDB locally or check your connection.");
            throw localErr;
        }
    }
}

const dbPromise = connectDB();

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || origin.startsWith("http://localhost:")) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const store = MongoStore.create({
    clientPromise: dbPromise.then(m => m.connection.getClient()),
    crypto: {
       secret: process.env.SECRET,
    }, 
    touchAfter: 24 * 3600,
})

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        expires: Date.now() + 7 * 24 * 60 *1000,
        maxAge:  7 * 24 * 60 * 1000,
        httpOnly: true,
    }
};

// app.get("/", (req, res) => {
//     res.send("Hi, I am root");
// }); 

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student",
//     }); 

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// })

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);  
app.use("/bookings", bookingRouter);
app.use("/", userRouter);


app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    let {statusCode = 500, message = "Something went wrong!"} = err;
    res.status(statusCode).json({ error: message });
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});