const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product" },
  size: String,
  color: String,
  image1: { type: String, default: null },
  image2: { type: String, default: null },
  image3: { type: String, default: null },
});

module.exports = mongoose.model("Item", ItemSchema);
