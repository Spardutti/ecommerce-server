const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: String,
  images: [],
  sizeColor: [],
  category: { type: Schema.Types.ObjectId, ref: "Category" },
});

module.exports = mongoose.model("Product", ProductSchema);
