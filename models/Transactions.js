const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionsSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  transaction_id: String,
  date: { type: Date, default: Date.now() },
  status: String,
  product: [],
});

module.exports = mongoose.model("Transactions", TransactionsSchema);
