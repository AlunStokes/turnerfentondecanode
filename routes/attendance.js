var express = require("express");
var router = express.Router();

//Load default back middlewares
router.use(require("./back"));

var loadCSS = require("../middlewares/loadCSS");

router.use(loadCSS([

]));

router.get("/", function(req, res, next) {
  res.render("attendance");
});

module.exports = router;
