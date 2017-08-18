var express = require("express");
var router = express.Router();

//Load default back middlewares
router.use(require("./back"));

var adminRoute = require("../middlewares/adminRoute");

router.use(adminRoute);

router.get("/", function(req, res, next) {
  res.render("attendance");
});

module.exports = router;
