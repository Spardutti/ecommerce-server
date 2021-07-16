const Product = require("../models/Product");
const Category = require("../models/Category");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const { uploadFile, deleteFileFromS3 } = require("../s3");
require("dotenv").config();

// NEW PRODUCT
exports.newProduct = [
  body("name").notEmpty().withMessage("Please enter a product name"),
  body("category").notEmpty().withMessage("Please select a product category"),
  body("price").notEmpty().withMessage("Please enter the product price"),
  body("size")
    .notEmpty()
    .toUpperCase()
    .withMessage("Please enter the product size"),
  body("color").notEmpty().withMessage("Please enter the product color"),
  body("quantity").notEmpty().withMessage("Please enter the product quantity"),
  async (req, res, next) => {
    const { name, description, size, color } = req.body;
    const price = parseInt(req.body.price);
    const quantity = parseInt(req.body.quantity);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json(errors.array());
    } else {
      try {
        const category = await Category.findById(req.body.category);
        const product = await Product.find({
          name,
        });
        if (product.length)
          return res.status(500).json([{ msg: "Product already exists" }]);
        else {
          const product = new Product({
            name,
            details: [{ color, size, quantity, price }],
            description,
            category,
          });
          await product.save();
          return res.json(product);
        }
      } catch (error) {
        res.status(500);
        return next(error);
      }
    }
  },
];

// UPDATE PRODUCT QUANTITY AND/OR PRICE
exports.updateProduct = [
  body("quantity").notEmpty().withMessage("Please add a quantity"),
  body("price").notEmpty().withMessage("Please add a valid price"),
  async (req, res, next) => {
    const { description } = req.body;
    const quantity = parseInt(req.body.quantity);
    const price = parseInt(req.body.price);
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.status(500).json(errors.array());
    else {
      try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(500).json("Product not found");
        product.price = price;
        product.quantity += quantity;
        product.description = description;
        await product.save();
        return res.json(product);
      } catch (err) {
        res.status(500);
        return next(err);
      }
    }
  },
];

// ADD IMAGES TO PRODUCT
exports.productImage = [
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.json(errors.array());
    else {
      const product = await Product.findById(req.params.id);
      if (!product) res.status(500).json("Product not found");
      if (!req.files) {
        return res.json("Please add at least 1 image to upload");
      } else {
        if (product.images.length + req.files.length > 5) {
          res.status(500).json({
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
    }
  },
];

// GET PRODUCT INFO
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    return next(err);
  }
};

// GET ALL PRODUCT
exports.allProducts = async (req, res, next) => {
  try {
    const products = await Product.find({});
    return res.json(products);
  } catch (err) {
    return next(err);
  }
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
exports.removeProduct = async (req, res, next) => {
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
exports.addToCart = async (req, res, next) => {
  const { id } = req.body;
  const quantity = parseInt(req.body.quantity);
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(500).json("User not found");
    const product = await Product.findById(id);
    if (!product) return res.status(500).json("Product not found");
    let cartItems = user.cart;
    let price = product.price;
    // if not enough stock return.
    if (product.quantity < quantity)
      return res.status(500).json("Not enough stock of " + product.name);

    cartItems.push(product);
    user.markModified("cart");
    await user.save();
    return res.json(user);
  } catch (error) {
    res.json(next(error));
  }
};

// DELETE PRODUCT FROM CART
exports.removeFromCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    const { indexToDelete } = req.body;
    user.cart.splice(indexToDelete, 1);
    user.markModified("cart");
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json(next(err));
  }
};
