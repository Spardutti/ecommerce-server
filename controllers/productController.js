const Product = require("../models/Product");
const Category = require("../models/Category");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const { uploadFile, deleteFileFromS3 } = require("../s3");
require("dotenv").config();

// NEW PRODUCT
exports.newProduct = [
  body("productName").notEmpty().withMessage("Please enter a product name"),
  (req, res, next) => {
    const { productName } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json(errors.array());
    } else {
      Category.findById(req.params.id, (err, category) => {
        if (err) return next(err);
        if (!category) {
          res.status(400).json("Category not found");
        } else {
          new Product({
            name: productName,
            category,
          }).save((err, newProduct) => {
            if (err) return next(err);
            res.json(newProduct);
          });
        }
      });
    }
  },
];

// UPDATE PRODUCT/ ADD SIZE AND COLOR & PRICE
exports.updateProduct = [
  body("size").notEmpty().withMessage("Please enter a size"),
  body("color").notEmpty().withMessage("Please enter a color"),
  body("quantity").isNumeric().notEmpty().withMessage("Please add a quantitiy"),
  body("price")
    .isNumeric()
    .notEmpty()
    .isNumeric()
    .withMessage("Please add a valid price"),
  (req, res, next) => {
    const { size, color } = req.body;
    const quantity = parseInt(req.body.quantity);
    const price = parseInt(req.body.price);
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.json(errors.array());
    else {
      Product.findById(req.params.id, (err, product) => {
        if (err) return next(err);
        if (!product) res.status(400).json("Product not  found");
        else {
          const info = { size, color, price, quantity };
          console.log(product);
          const arr = product.sizeColor;
          // CHECK IF PRODUCT IS EMPTY
          if (arr.length > 0) {
            for (let i = 0; i < arr.length; i++) {
              // UPDATE THE QUANTITIY
              if (arr[i].color === color && arr[i].size === size) {
                arr[i].quantity += quantity;
                break;
              }
            }
          } else {
            // ADD THE INFO
            arr.push(info);
          }
          product.markModified("sizeColor");
          product.save((err, newProduct) => {
            if (err) return next(err);
            res.json(newProduct);
          });
        }
      });
    }
  },
];

// REMOVE ITEM COLOR AND SIZE / SELl - REMOVE
// TODO CHECK THE QUANTITIES
exports.sellProduct = [
  body("size").notEmpty().withMessage("Please enter the size to remove/sell"),
  body("color").notEmpty().withMessage("Please enter the color to remove/sell"),
  (req, res, next) => {
    const { size, color } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.json(errors.array());
    else {
      Product.findById(req.params.id, (err, product) => {
        if (err) return next(err);
        if (!product) return res.status(400).json("Product not found");
        else {
          let arr = product.sizeColor;
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].color === color && arr[i].size === size) {
              arr.splice(i, 1);
              break;
            } else return res.json("Product out of stock");
          }
          product.save((err) => {
            if (err) return next(err);
            res.json(product);
          });
        }
      });
    }
  },
];

// ADD IMAGES TO PRODUCT
exports.productImage = [
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.json(errors.array());
    else {
      Product.findById(req.params.id, (err, product) => {
        if (err) return next(err);
        if (!product) {
          res.status(400);
          return res.json("Product not found");
        }
        if (!req.files) {
          return res.json("Please add at least 1 image to upload");
        } else {
          if (product.images.length + req.files.length > 5) {
            res.status(400).json({
              msg:
                "This product currently have: " +
                product.images.length +
                " images. Maximun is 5. You are trying to upload: " +
                req.files.length +
                " images.",
            });
          } else {
            let promises = [];
            for (let i = 0; i < req.files.length; i++) {
              promises.push(uploadFile(req.files[i]));
            }
            Promise.all(promises)
              .then((data) => {
                data.forEach((link) =>
                  product.images.push({ url: link.Location, Key: link.Key })
                );
                product.save((err) => {
                  if (err) return next(err);
                  res.json(product);
                });
              })
              .catch((err) => res.json(err));
          }
        }
      });
    }
  },
];

// GET PRODUCT INFO
exports.getProduct = (req, res, next) => {
  Product.findById(req.params.id, (err, product) => {
    if (err) return next(err);
    if (!product) res.status(400).json("Product not found");
    else {
      res.json(product);
    }
  });
};

// DELETE PRODUCT IMAGE
exports.deleteProductImage = (req, res, next) => {
  const { imageToDeleteIndex } = req.body;
  Product.findById(req.params.id, async (err, product) => {
    if (err) return next(err);
    if (!product) res.status(400).json("Product not found");
    else {
      if (!product.images) return res.json("No image to delete");
      const imageKey = product.images[imageToDeleteIndex].Key;
      product.images.splice(imageToDeleteIndex, 1);
      await deleteFileFromS3(imageKey);
      product.save((err) => {
        if (err) return next(err);
        res.json("Image deleted succesfully");
      });
    }
  });
};

// DELETE A PRODUCT WITH ALL INFO
exports.removeProduct = (req, res, next) => {
  Product.findByIdAndRemove(req.params.id, async (err, product) => {
    if (err) return next(err);
    if (!product) return res.status(400).json("Product not found");
    else {
      let arr = product.images;
      for (let i = 0; i < arr.length; i++) {
        await deleteFileFromS3(arr[i].Key);
      }
      res.json("Deleted " + product);
    }
  });
};

// ADD PRODUCT TO CURRENT USER CART
exports.addToCart = (req, res, next) => {
  const { id, size, color } = req.body;
  const quantity = parseInt(req.body.quantity);
  User.findById(req.params.id, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(400).json("User not found");
    Product.findById(id, (err, product) => {
      if (err) return next(err);
      if (!product) return res.status(400).json("Product not found");
      let arr = product.sizeColor;
      // CHECK IF THE PRODUCT IS AVAILABLE AND ADD THE QUANTITY TO THE USER CART
      arr.forEach((arrItem) => {
        const productDetails = {
          name: product.name,
          size,
          color,
          quantity,
          price: arrItem.price,
        };
        if (
          arrItem.size === size &&
          arrItem.color === color &&
          arrItem.quantity >= quantity
        ) {
          if (user.cart.length > 0) {
            user.cart.forEach((elem) => {
              if (elem.size === size && elem.color === color) {
                elem.quantity += quantity;
                return;
              } else {
                user.cart.push(productDetails);
                return;
              }
            });
          } else {
            user.cart.push(productDetails);
          }
        } else return res.status(400).json("Item out of stock");
      });
      user.markModified("cart");
      user.save((err) => {
        if (err) return next(err);
        res.json(user);
      });
    });
  });
};
