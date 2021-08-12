const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: String,
  googleId: String,
  password: String,
  email: String,
  phone: Number,
  city: String,
  street: String,
  zip: Number,
  purchases: [],
  cart: [],
  admin: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", UserSchema);
