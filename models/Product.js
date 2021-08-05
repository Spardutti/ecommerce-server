const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: String,
  images: [],
  details: [{ color: String, size: String, quantity: Number }],
  price: Number,
  description: String,
  category: { type: Schema.Types.ObjectId, ref: "Category" },
});

module.exports = mongoose.model("Product", ProductSchema);
