let express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.json("hola");
});

module.exports = router;
