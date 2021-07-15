const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: String,
  images: [],
  color: String,
  size: String,
  price: Number,
  quantity: Number,
  description: String,
  category: { type: Schema.Types.ObjectId, ref: "Category" },
});

module.exports = mongoose.model("Product", ProductSchema);
