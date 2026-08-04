const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const usersController = require("../controllers/users.js");

router.post("/signup", wrapAsync(usersController.signup));

router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ error: info ? info.message : "Incorrect username or password." });
        }
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }
            return usersController.login(req, res, next);
        });
    })(req, res, next);
});

router.get("/logout", usersController.logout);

router.get("/current-user", (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            user: {
                _id: req.user._id,
                username: req.user.username,
                email: req.user.email
            }
        });
    } else {
        res.json({ user: null });
    }
});

module.exports = router;