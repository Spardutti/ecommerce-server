let express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const categoryController = require("../controllers/categoryControllers");
const productController = require("../controllers/productController");
const checkoutController = require("../controllers/checkoutController");
const passport = require("passport");
const multer = require("multer");
const uniqid = require("uniqid");

const storage = multer.diskStorage({
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

/****************************************** CATEGORY */

// NEW CATEGORY
router.post("/category/new", categoryController.newCategory);

/******************************************* PRODUCTS */

// CREATE NEW PRODUCT
router.post("/product/new/:id", productController.newProduct);

// GET PRODUCT INFO
router.get("/product/:id", productController.getProduct);

// UPDATE PRODUCT INFO
router.put("/product/update/:id", productController.updateProduct);

// ADD PRODUCT IMAGE
router.put(
  "/product/image/:id",
  upload.array("image", 5),
  productController.productImage
);

// REMOVE IMAGE FROM PRODUCT
router.delete(
  "/product/delete/image/:id",
  productController.deleteProductImage
);

// REMOVE A PRODUCT WITH ALL INFO
router.delete("/product/:id", productController.removeProduct);

// ADD PRODUCT TO USER CART
router.put("/product/cart/:id", productController.addToCart);

// TEST
router.get("/checkout/:id", checkoutController.checkout);

//TEST
router.get("/feedback", checkoutController.feedback);

// TEST
router.post("/stock/:id", checkoutController.checkCartStock);

module.exports = router;
