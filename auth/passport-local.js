const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");
const bcrypt = require("bcryptjs");

passport.use(
  new LocalStrategy((username, password, done) => {
    // Set username to lowercase
    let lowerCaseUsername = username.toLowerCase();
    User.findOne({ username: lowerCaseUsername }, (err, user) => {
      if (err) return next(err);
      if (!user) {
        return done(null, false);
      }
      // compare passwords
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (isMatch) {
          //log in
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
