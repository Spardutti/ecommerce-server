const Product = require("../models/Product");
const User = require("../models/User");
const mercadopago = require("mercadopago");
require("dotenv").config();

mercadopago.configure({
  access_token:
    "APP_USR-5713106896067816-062820-4039e5c8877d6946b5645719d0f423ae-782636851",
});

// MERCADO TEST
exports.checkout = (req, res, next) => {
  User.findById(req.params.id, async (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(400).json("User not found");
    else {
      let preference = {
        items: [],
        back_urls: {
          success: "http://localhost:3000/#/purchasesuccess",
          failure: "http://localhost:5000/failure",
          pending: "http://localhost:5000/feedback",
        },
        auto_return: "approved",
        payer: {
          name: user.username,
          email: user.email,
          identification: {},
          address: {
            street_name: "Calle",
          },
        },
      };
      user.cart.forEach((item) => {
        preference.items.push({
          title: item.name,
          unit_price: item.price,
          quantity: item.quantity,
          picture_url: item.image,
        });
      });
      // CHECK STOCK
      const itemsToCheck = user.cart;
      for (item of itemsToCheck) {
        const product = await Product.findOne({ name: item.name });
        for (detail of product.details) {
          if (
            item.size === detail.size &&
            item.color === detail.color &&
            item.quantity > detail.quantity
          ) {
            return res.status(500).json(`${item.name} is no longer in stock`);
          }
        }
      }
      mercadopago.preferences
        .create(preference)
        .then(function (response) {
          res.json(response.body);
        })
        .catch(function (error) {
          return error;
        });
    }
  });
};
exports.success = async (req, res, next) => {
  res.redirect("http://localhost:3000/#/itempurchaseddetail");
};
