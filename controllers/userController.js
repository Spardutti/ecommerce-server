const User = require("../models/User");
const passport = require("passport");
require("dotenv").config();

//GOOGLE LOGIN
exports.googleLogin = (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })(req, res, next);
};

exports.googleRedirect = (req, res, next) => {
  passport.authenticate("google", {
    failureRedirect: "/",
    successRedirect: "/token",
  })(req, res, next);
};
