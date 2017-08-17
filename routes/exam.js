var express = require("express");
var router = express.Router();

//Middlewares
var loadJS = require("../middlewares/loadJS");
var loadExam = require("../middlewares/loadExam");

//Load default back middlewares
router.use(require("./back"));


router.use(loadJS([
  "js/dist/exam.min.js"
]));

router.get("/", function(req, res, next) {
  res.redirect("practice");
});

router.post("/", loadExam, function(req, res, next) {
  if (res.locals.errors.length) {
    res.redirect("practice");
    return;
  }
  res.render("exam");
});

module.exports = router;
