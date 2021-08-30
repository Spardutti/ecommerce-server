# WORK IN PROGRESS.

# ECOMMERCE

[LIVE DEMO](https://spardutti.github.io/ecommerce-client/).

[Client repo](https://github.com/Spardutti/ecommerce-client)

# Tools

This project was made using: MongoDB, Express, NodeJs, ReactJs, MercadoPago Checkout Pro.

# The Project

RESTfull ecommerce, where the owner can upload new products or edit existing ones, this app will keep track of the quantity of the products,
performing a check before an user is redirected to the checkout page, to avoid purchasing more items than currently available.

The clients will be able to browse the items in this shop by different ways, browsing all the products, searching for a specific product
in the search bar, which will give the user suggestions on the products name, or go to a category tab and browse all items in each category
(ex: Shoes, Hats, etc).
Then the user will be able to add the product they want to the shopping cart, and once in the cart they will be able to update that product, adding more quantity
or deleting the item fron the user cart. Once the user is ready to checkout, the site will generate a transaction id with the info of the transactions and the status, either "approved", "pending", or "canceled".
