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
  body("price")
    .isFloat({ min: 1, max: 999999 })
    .withMessage("Please enter the product price"),
  body("size")
    .isLength({ max: 2 })
    .withMessage("Size cant be longer than 2, ex: XL, M, S.")
    .notEmpty()
    .toUpperCase()
    .withMessage("Please enter the product size"),
  body("color").notEmpty().withMessage("Please enter the product color"),
  body("quantity")
    .isFloat({ min: 1, max: 9999 })
    .withMessage("Please enter the product quantity"),
  body("description").notEmpty().withMessage("Please add a brief description"),
  async (req, res, next) => {
    const { name, size, color, description } = req.body;
    const price = parseInt(req.body.price);
    const quantity = parseInt(req.body.quantity);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (!req.files[0]) {
        errors.errors.push({ msg: "Please add a product image" });
      }
      return res.status(500).json(errors.array());
    } else {
      try {
        const category = await Category.findById(req.body.category);
        const product = await Product.findOne({
          name,
        });
        if (product)
          return res.status(500).json([{ msg: "Product already exists" }]);
        else {
          const image = await uploadFile(req.files[0]);
          const product = new Product({
            name,
            details: [{ color, size, quantity }],
            price,
            description,
            category,
          });
          product.images.push({ url: image.Location, key: image.Key });
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

// UPDATE PRODUCT DESCRIPTION
exports.udpateDescription = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    product.description = req.body.description;
    await product.save();
    res.json(product);
  } catch (err) {
    return res.json(next(err));
  }
};

// UPDATE PRODUCT DETAILS
exports.updateProduct = async (req, res, next) => {
  const { color, size } = req.body;
  const quantity = parseInt(req.body.quantity);
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(500).json("Product not found");
    const { details } = product;
    if (details.length > 0) {
      for (let prop of details) {
        // EDIT EXISTING DETAIL
        if (prop.size == size && prop.color == color) {
          let index = details.indexOf(prop);
          details[index].quantity = quantity;
          product.markModified("details");
          await product.save();
          return res.json(product);
        } else {
          // ADD NEW DETAIL
          const newDetail = { color, size, quantity };
          details.push(newDetail);
          product.markModified("details");
          await product.save();
          return res.json(newDetail);
        }
      }
    } else {
      // ADD NEW DETAIL
      const newDetail = { color, size, quantity };
      details.push(newDetail);
      product.markModified("details");
      await product.save();
      return res.json(newDetail);
    }
  } catch (err) {
    res.status(500);
    return next(err);
  }
};

// DELETE PRODUCT DETAIL
exports.deleteProductDetail = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product.details.length <= 1) {
      return res.status(500).json({
        msg: "Product cant be empty, either remove the product or add new info",
        status: 500,
      });
    }
    product.details.splice(req.body.index, 1);
    await product.save();
    return res.status(200).json(product);
  } catch (err) {
    return res.json(next(err));
  }
};

// ADD IMAGES TO PRODUCT
exports.productImage = [
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!req.files[0])
      errors.errors.push({ msg: "Please add at least 1 image to add" });
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
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    return res.json(next(err));
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
    if (!product) res.status(500).json("Product not found");
    else {
      if (!product.images || !product.images[imageToDeleteIndex])
        return res.status(500).json("No image to delete");
      const imageKey = product.images[imageToDeleteIndex].Key;
      product.images.splice(imageToDeleteIndex, 1);
      await deleteFileFromS3(imageKey);
      product.save((err) => {
        if (err) return next(err);
        return res.status(200).json(product);
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
  const { id, color } = req.body;
  const quantity = parseInt(req.body.quantity);
  const size = req.body.size.toUpperCase();
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(500).json("User not found");
    const product = await Product.findById(id);
    if (!product) return res.status(500).json("Product not found");
    const { details } = product;
    const { cart } = user;
    // FIND THE DETAILS OF THE PRODUCT, SIZE/COLOR
    const detailIndex = details.findIndex(
      (elem) => elem.size === size && elem.color === color
    );
    // CREATE A NEW OBJECT TO ADD TO THE CART
    let detail = details[detailIndex];
    const productToAdd = {
      name: product.name,
      category: product.category,
      size: detail.size,
      color: detail.color,
      quantity,
      price: product.price,
      image: product.images[0].url,
    };
    // CHECK IF PRODUCT IS IN THE CART
    const productIndex = cart.findIndex((elem) => elem.name === product.name);
    if (productIndex < 0 || !cart.length) {
      // CHECK QUANTITY
      if (details[detailIndex].quantity >= quantity) {
        cart.push(productToAdd);
      } else {
        return res
          .status(500)
          .json(
            `${product.name} size: ${size} and color: ${color} is not currently in stock`
          );
      }
    }
    // IF PRODUCT EXIST CHECK FOR DETAILS
    else {
      const userCart = cart[productIndex];
      // IF PRODUCT COLOR AND SIZE ARE THE SAME, UPDATE THE QUANTITY
      if (userCart.color === color && userCart.size === size) {
        userCart.quantity++;
      }
      // IF IT IS A NEW PRODUCT, ADD IT
      else {
        if (details[detailIndex].quantity >= quantity) {
          cart.push(productToAdd);
        } else {
          return res
            .status(500)
            .json(
              `${product.name} size: ${size} and color: ${color} is not currently in stock`
            );
        }
      }
    }

    user.markModified("cart");
    await user.save();
    return res.json(user);
  } catch (error) {
    res.json(next(error));
  }
};

// UPDATE USER CART ADD/ REMOVE
exports.updateUserCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    user.cart = req.body.cart;
    user.markModified("cart");
    await user.save();
    res.json(user);
  } catch (err) {
    res.json(next(err));
  }
};

// UPDATE USER PURCHASES
exports.updateUserPurchases = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    user.purchases.push(req.body.purchase);
    user.markModified("purchases");
    await user.save();
    res.json(user);
  } catch (err) {
    return res.status(500).json(next(err));
  }
};

// UPDATE THE PURCHASES STATUS TO APPROVED AND CLEAR CART
exports.updateSuccessPurchase = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    user.purchases[req.body.index].status = "approved";
    user.cart = [];
    user.markModified("cart");
    user.markModified("purchases");
    await user.save();
    res.json(user);
  } catch (err) {
    res.json(next(err));
  }
};

// GET PURCHASES DETAIL
exports.purchaseDetail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    const purchase = user.purchases[req.body.index];
    res.json(purchase);
  } catch (err) {
    res.status(500).json(next(err));
  }
};
