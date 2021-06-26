const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductDescriptionSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product" },
  size: [],
  color: [],
  xxx: [{ talle, color }],
  images: [],
});

module.exports = mongoose.model("Item", ProductDescriptionSchema);
