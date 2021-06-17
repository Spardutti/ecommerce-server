let express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const passport = require("passport");

const jwtProtected = passport.authenticate("jwt", { session: false });

router.get("/", (req, res, next) => res.json("home"));

// GOOGLE LOG IN
router.get("/user/google/login", userController.googleLogin);

//GOOGLE CALLBACK URL
router.get("/user/google/success", userController.googleRedirect);

//GET THE TOKEN AFTER GOOGLE LOG IN
router.get("/token", userController.jwtoken);

// LOG OUT
router.get("/user/logout", userController.logOut);

// GOOGLE LOGGED IN JUST FOR DEVELOPMENT
router.get("/user/logged", (req, res, next) => res.json("token created"));

// CREATE NEW USER
router.post("/user/new", userController.createUser);

module.exports = router;
