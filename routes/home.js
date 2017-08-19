var express = require("express");
var router = express.Router();

//Load default back middlewares
router.use(require("./back"));

var loadJS = require("../middlewares/loadJS");

router.use(loadJS([
  
]));

router.get("/", function(req, res, next) {
  res.render("home");
});

module.exports = router;
