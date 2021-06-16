let express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// GOOGLE LOG IN
router.get("/user/google/login", userController.googleLogin);

//GOOGLE CALLBACK URL
router.get("/user/google/success", userController.googleRedirect);

//GET THE TOKEN AFTER GOOGLE LOG IN
router.get("/token", (req, res, next) => res.json("logged"));

module.exports = router;
