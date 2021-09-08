const Category = require("../models/Category");
const Product = require("../models/Product");
const { body, validationResult } = require("express-validator");
const { uploadFile, deleteFileFromS3 } = require("../s3");

// CREATE NEW CATEGORY
exports.newCategory = [
  body("name").notEmpty().withMessage("Please enter a category name"),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!req.file) errors.errors.push({ msg: "Please add an image" });
    if (!errors.isEmpty()) res.status(500).json(errors.array());
    else {
      const { name } = req.body;
      const category = await Category.findOne({ name });
      if (category) {
        res.status(400).json("Category already exist");
      } else {
        const image = await uploadFile(req.file);
        const newCategory = new Category({
          name,
          image: { url: image.Location, key: image.key },
        });
        await newCategory.save();
        res.json(newCategory);
      }
    }
  },
];

// GET ALL CATEGORIES
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (err) {
    return next(err);
  }
};

// GET PRODUCT BY CATEGORY
exports.productByCat = async (req, res, next) => {
  try {
    const products = await Product.find({ category: req.body.category });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(next(err));
  }
};

// REMOVE CATEGORY
exports.removeCategory = async (req, res, next) => {
  try {
    const productUsingCategory = await Product.find({
      category: req.params.id,
    });
    if (productUsingCategory.length > 0) {
      return res
        .status(500)
        .json(
          "Please remove all items using this category before deleting the category"
        );
    } else {
      const category = await Category.findById(req.params.id);
      if (category) {
        res.json("Category Deleted");
      }
      res.status(500).json("Category not found");
    }
  } catch (err) {
    res.status(500).json(next(err));
  }
};
