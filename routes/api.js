let express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const passport = require("passport");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const jwtProtected = passport.authenticate("jwt", { session: false });

// GOOGLE LOG IN
router.get("/user/google/login", userController.googleLogin);

//GOOGLE CALLBACK URL
router.get("/user/google/success", userController.googleRedirect);

//GET THE TOKEN AFTER GOOGLE LOG IN
router.get("/token", userController.jwtoken);

// LOG OUT
router.get("/user/logout", userController.logOut);

// CREATE NEW USER
router.post("/user/new", userController.createUser);

// LOGIN LOCAL USER
router.post("/user/login", userController.localLogin);

/****************************************** ITEMS */

//TEST
router.post("/img", upload.single("img"), userController.img);

module.exports = router;
