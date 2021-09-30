let express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const categoryController = require("../controllers/categoryControllers");
const productController = require("../controllers/productController");
const checkoutController = require("../controllers/checkoutController");

const transactionController = require("../controllers/transactionsController");
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

// USER
router.get("/user/:id", userController.user);

// GOOGLE LOG IN
router.get("/user/google/login", userController.googleLogin);

//GOOGLE CALLBACK URL
router.get("/user/google/success", userController.googleRedirect);

//GET THE TOKEN AFTER GOOGLE LOG IN
router.get("/token", userController.jwtoken);

// LOG OUT
router.get("/logout", userController.logOut);

// CREATE NEW USER
router.post("/user/new", userController.createUser);

// LOGIN LOCAL USER
router.post("/user/login", userController.localLogin);

/****************************************** CATEGORY */

// NEW CATEGORY
router.post(
  "/category/new",
  upload.single("image"),
  categoryController.newCategory
);

// GET ALL CATEGORIES
router.get("/categories", categoryController.getAllCategories);

// REMOVE CATEGORY
router.delete("/category/:id", categoryController.removeCategory);

// PRODUCT BY CATEGORY
router.post("/category/product", categoryController.productByCat);

/******************************************* PRODUCTS */

// CREATE NEW PRODUCT
router.post(
  "/product/new",
  upload.array("image", 5),
  productController.newProduct
);

// GET PRODUCT INFO
router.get("/product/:id", productController.getProduct);

// GET ALL PRODUCTS
router.get("/products", productController.allProducts);

// UPDATE PRODUCT INFO
router.put("/product/update/:id", productController.updateProduct);

// UPDATE DESCRIPTION
router.put("/product/description/:id", productController.udpateDescription);

// DELETE PRODUCT INFO/DETAIL
router.delete("/product/details/:id", productController.deleteProductDetail);

// ADD PRODUCT IMAGE
router.put(
  "/product/image/:id",
  upload.array("image", 4),
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

// UPDATE USER CART
router.put("/user/product/cart/:id", productController.updateUserCart);

// UPDATE USER PRUCHASES
router.put("/user/purchases/:id", productController.updateUserPurchases);

// APPROVE PURCHASE
router.put("/user/success/:id", productController.updateSuccessPurchase);

// GET PURCHASE DETAIL
router.post("/purchase/detail/:id", productController.purchaseDetail);

/***************************************** CHECKOUT */

// CHECK STOCK AND CHECKOUT
router.post("/checkout/:id", checkoutController.checkout);

/******************************************** TRANSACTIONS */

// NEW TRANSACTION
router.post("/transaction/new", transactionController.newTransaction);

// GET SPECIFIC TRANSACTION
router.get("/transaction/:id", transactionController.getTransaction);

// GET USER TRANSACTIONS
router.get("/transactions/user/:user", transactionController.userTransactions);

// UPDATE TRANSACTION STATUS
router.put(
  "/transaction/update",
  transactionController.updateTransactionStatus
);

// GET ALL TRANSACTIONS
router.get("/transactions/all", transactionController.allTransactions);

module.exports = router;
