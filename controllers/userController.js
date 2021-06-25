const User = require("../models/User");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const async = require("async");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const { uploadFile } = require("../s3");

//WORKING !
exports.img = async (req, res, next) => {
  let promises = [];
  for (let i = 0; i < req.files.length; i++) {
    promises.push(uploadFile(req.files[i]));
  }
  Promise.all(promises)
    .then(() => {
      res.json("uploaded");
    })
    .catch((err) => res.json(err));
};

/* 
exports.img = async (req, res, next) => {
  console.log("here");
  try {
    const result = await uploadFile(req.file);
    console.log("uplaoded both");
    res.json(result);
  } catch (err) {
    res.json(req.file);
  }
};
*/

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

// CREATE NEW USER
exports.createUser = [
  body("email")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false })
    .withMessage("Please enter a valid email format"),
  body("username")
    .isLength({ min: 4 })
    .toLowerCase()
    .withMessage("Username must be at least 4 characters long"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("confirm", "password must match")
    .exists()
    .custom((value, { req }) => value === req.body.password),

  (req, res, next) => {
    const validationErrors = validationResult(req);
    // IF THERE ARE ERRORS
    if (!validationErrors.isEmpty()) {
      res.json({ errors: validationErrors.array() });
    } else {
      const { username, email, password } = req.body;
      async.parallel(
        {
          email: function (callback) {
            User.findOne({ email }).exec(callback);
          },
          username: (callback) => {
            User.findOne({ username }).exec(callback);
          },
        },

        (err, results) => {
          if (err) return next(err);
          if (results.email) {
            res.json("Email already in use");
          }
          if (results.username) {
            res.json("Username already in use");
          } else {
            bcrypt.hash(password, 10, (err, hash) => {
              if (err) return next(err);
              new User({
                email,
                username,
                password: hash,
              }).save((err, user) => {
                if (err) return next(err);
                res.json(user);
              });
            });
          }
        }
      );
    }
  },
];

// LOG IN LOCAL USER
exports.localLogin = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      res.status(401);
      res.json("Wrong username or password");
    } else {
      req.login(user, { session: false }, (err) => {
        if (err) return next(err);
        const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
          expiresIn: "60m",
        });
        res.json(token);
      });
    }
  })(req, res, next);
};
