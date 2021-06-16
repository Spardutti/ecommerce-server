const User = require("../models/User");
const passport = require("passport");
const jwt = require("jsonwebtoken");

require("dotenv").config();

//GOOGLE LOGIN
exports.googleLogin = (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })(req, res, next);
};

// GOOGLE CALLBACK
exports.googleRedirect = (req, res, next) => {
  passport.authenticate("google", {
    failureRedirect: "/",
    successRedirect: "/token",
  })(req, res, next);
};

// GENERATE TOKEN
exports.jwtoken = (req, res, next) => {
  if (req.user) {
    const token = jwt.sign(req.user.toJSON(), process.env.JWT_SECRET, {
      expiresIn: "60m",
    });
    res.redirect("http://localhost:5000/user/logged?token=" + token);
  } else res.redirect("http://localhost:5000/");
};

// LOG OUT
exports.logOut = (req, res, next) => {
  req.logout();
  res.json("logged out");
};
