const Product = require("../models/Product");
const User = require("../models/User");
const mercadopago = require("mercadopago");
require("dotenv").config();

mercadopago.configure({
  access_token:
    "APP_USR-5713106896067816-062820-4039e5c8877d6946b5645719d0f423ae-782636851",
});

// CHECK IF STOCK IF AVAILABLE BEFORE CHECKOUT
exports.checkCartStock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    const itemsToCheck = user.cart;
    for (item of itemsToCheck) {
      console.log(item.price);
      const product = await Product.findOne({ name: item.name });
      let index = product.sizeColor.findIndex(
        (ele) => ele.size === item.size && ele.color === item.color
      );
      if (product.sizeColor[index].quantity < item.quantity) {
        return res
          .status(500)
          .json(
            "Not enough stock of: " +
              item.name +
              ", color: " +
              item.color +
              ", size: " +
              item.size
          );
      }
    }
    res.redirect("/checkout/" + user.id);
  } catch (error) {
    res.status(500).json(error);
  }
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
          failure: "http://localhost:5000/failure",
          pending: "http://localhost:5000/feedback",
        },
        auto_return: "approved",
      };
      user.cart.forEach((item) => {
        preference.items.push({
          title: item.name,
          unit_price: item.price,
          quantity: item.quantity,
        });
      });
      console.log(preference);
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
};

exports.feedback = (req, res, next) => {
  res.json({
    hola: "hola",
    /*Payment: req.query.payment_id,
    Status: req.query.status,
    MerchantOrder: req.query.merchant_order_id,
    response: req.query,*/
  });
};
