var express = require("express");
var router = express.Router();

//Load default back middlewares
router.use(require("./back"));

router.get("/", function(req, res, next) {
  res.render("practice");
});

module.exports = router;
