var express = require("express");
var router = express.Router();

var loadJS = require("../middlewares/loadJS");
var loadCSS = require("../middlewares/loadCSS");
var adminRoute = require("../middlewares/adminRoute");

router.use(adminRoute);

//Load default back middlewares
router.use(require("./back"));


router.use(loadJS([
  "js/dist/create-exam.min.js"
]));
router.use(loadCSS([
  "stylesheets/dist/create-exam.min.css"
]));

router.get("/", function(req, res, next) {
  res.render("createExam");
});

router.post("/", function(req, res, next) {
  res.redirect("createExam");
});

module.exports = router;
