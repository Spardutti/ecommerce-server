const Transactions = require("../models/Transactions");
const User = require("../models/User");

// NEW TRANSACTION
exports.newTransaction = async (req, res, next) => {
  try {
    const { userId, transaction_id, date, status, items } = req.body;
    const transaction = new Transactions({
      user: userId,
      transaction_id,
      status,
      product: items,
      date,
    });
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).json(next(err));
  }
};

// GET  SPECIFIC TRANSACTION
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transactions.findOne({
      transaction_id: req.params.id,
    });
    if (!transaction) return res.status(500).json("Not Found");
    res.json(transaction);
  } catch (err) {
    res.json(next(err));
  }
};

// UPDATE TRANSACTION STATUS
exports.updateTransactionStatus = async (req, res, next) => {
  try {
    const transaction = await Transactions.findOne({
      transaction_id: req.body.id,
    });
    transaction.status = req.body.status;
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    return next(err);
  }
};

// GET ALL USER TRANSACTIONS
exports.userTransactions = async (req, res, next) => {
  try {
    const transaction = await Transactions.find({
      user: req.params.user,
    }).sort({ date: "desc" });
    res.json(transaction);
  } catch (err) {
    return next(err);
  }
};

// GET ALL TRANSACTIONS
exports.allTransactions = async (req, res, next) => {
  try {
    const transactions = await Transactions.find()
      .sort({ date: "desc" })
      .populate("user");
    res.json(transactions);
    //res.json(transactions);
  } catch (err) {
    return next(err);
  }
};
