const Item = require("../models/ProductDescription");
const Product = require("../models/Product");
const { body, validationResult } = require("express-validator");

// ADD NEW PRODUCT DESCRIPTION
exports.newDescription = [
  body("productSize").notEmpty().whitelist("Please enter a product size"),
  body("productColor").notEmpty().withMessage("Please enter a product color"),
  body("productImage")
    .notEmpty()
    .withMessage("You need to upload at least 1 image for the product"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.json(errors.array());
    else {
      Product.findById(req.params.id, (err, product) => {
        if (err) return next(err);
        if (!product) res.status(400).json("Product not found");
        else {
        }
      });
    }
  },
];
