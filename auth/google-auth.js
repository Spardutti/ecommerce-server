const GoogleStrategy = require("passport-google-oauth2").Strategy;
const passport = require("passport");
const User = require("../models/User");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      //callbackURL: "http://localhost:5000/user/google/success", // DEV
      callbackURL: "https://ecommercedemosite.herokuapp.com", // LIVE
    },
    (acessToken, refreshToken, profile, done) => {
      User.findOne({ email: profile.email }, (err, user) => {
        if (user) {
          done(null, user);
        } else {
          let userName = profile.given_name.toLowerCase();
          new User({
            username: userName,
            googleId: profile.id,
            email: profile.email,
          }).save((err, newUser) => {
            done(null, newUser);
          });
        }
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
