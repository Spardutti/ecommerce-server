let express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const passport = require("passport");
const multer = require("multer");
const uniqid = require("uniqid");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    // THE IMAGE DEFAULT NAME
    cb(null, uniqid() + file.originalname);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2000000 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      const err = new Error("Only .png, .jpg and .jpeg format allowed!");
      err.name = "ExtensionError";
      return cb(err);
    }
  },
});

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
router.post("/img", upload.array("img", 5), userController.img);

module.exports = router;
