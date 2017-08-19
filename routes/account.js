var express = require("express");
var router = express.Router();

var loadJS = require("../middlewares/loadJS");
var loadCSS = require("../middlewares/loadCSS");

//Load default back middlewares
router.use(require("./back"));


router.use(loadJS([
  
]));
router.use(loadCSS([

]));

router.get("/", function(req, res, next) {
  res.render("account");
});

router.post("/", function(req, res, next) {
  res.redirect("account");
});

module.exports = router;
