const Category = require("../models/Category");

// CREATE NEW CATEGORY
exports.newCategory = (req, res, next) => {
  const { categoryName } = req.body;
  Category.findOne({ name: categoryName }, (err, category) => {
    if (err) return next(err);
    if (category) {
      res.status(400).json("Category already exist");
    } else {
      new Category({
        name: categoryName,
      }).save((err, newCategory) => {
        if (err) return next(err);
        res.json(newCategory);
      });
    }
  });
};
