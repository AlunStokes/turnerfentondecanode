var express = require("express");
var router = express.Router();

var loadJS = require("../middlewares/loadJS");
var loadCSS = require("../middlewares/loadCSS");

//Load default back middlewares
router.use(require("./back"));


router.use(loadJS([
  "js/dist/add-question.min.js"
]));
router.use(loadCSS([
  //"stylesheets/dist/add-question.min.css"
]));

router.get("/", function(req, res, next) {
  res.render("addQuestion");
});

router.post("/", function(req, res, next) {
  res.redirect("addQuestion");
});

module.exports = router;
