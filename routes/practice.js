var express = require("express");
var router = express.Router();

//Load default back middlewares
router.use(require("./back"));

var loadCSS = require("../middlewares/loadCSS");

router.use(loadCSS([
  "stylesheets/dist/practice.min.css"
]));

router.get("/", function(req, res, next) {
  res.render("practice");
});

module.exports = router;
