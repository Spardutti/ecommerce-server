const Product = require("../models/Product");
const User = require("../models/User");
const mercadopago = require("mercadopago");
require("dotenv").config();

mercadopago.configure({
  access_token:
    "APP_USR-5713106896067816-062820-4039e5c8877d6946b5645719d0f423ae-782636851",
});

// CHECK IF STOCK IF AVAILABLE BEFORE CHECKOUT
exports.checkCartStock = (req, res, next) => {
  User.findById(req.params.id, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(400).json("User not found");
    else {
      user.cart.forEach((item) => {
        Product.find({ name: item.name }, (err, products) => {
          if (err) return next(err);
          products.forEach((product) => {
            product.sizeColor.forEach((info) => {
              if (
                info.size === item.size &&
                info.color === item.color &&
                info.quantity >= item.quantity
              ) {
                // UPDATE DB STOCK
                info.quantity -= item.quantity;
                product.markModified("sizeColor");
                product.save((err) => {
                  if (err) return next(err);
                  // PROCEED TO CHECKOUT
                  return res.json(products);
                });
              } else
                res.status(400).json({ item: item.name, msg: "Out of stock" });
            });
          });
        });
      });
    }
  });
};

// MERCADO TEST
exports.checkout = (req, res, next) => {
  User.findById(req.params.id, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(400).json("User not found");
    else {
      let preference = {
        items: [],
        back_urls: {
          success: "http://localhost:5000/feedback",
          failure: "http://localhost:5000/feedback",
          pending: "http://localhost:5000/feedback",
        },
        auto_return: "approved",
      };
      user.cart.forEach((item) => {
        preference.items.push({
          title: "hola",
          unit_price: item.price,
          quantity: item.quantity,
        });
      });

      mercadopago.preferences
        .create(preference)
        .then(function (response) {
          res.redirect(response.body.init_point);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  });
  const { item, price, quantity } = req.body;
  // Create a preference object
};

exports.feedback = (req, res, next) => {
  res.json({
    Payment: req.query.payment_id,
    Status: req.query.status,
    MerchantOrder: req.query.merchant_order_id,
  });
};
