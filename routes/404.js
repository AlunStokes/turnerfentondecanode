var express = require('express');
var router = express.Router();

//Load default front middlewares
router.use(require("./front"));

//Middlewares
var loadCSS = require("../middlewares/loadCSS");
var loadJS = require("../middlewares/loadJS");

router.use(loadCSS([
  "stylesheets/dist/404.min.css"
]))
router.use(loadJS([

]))

router.get("/", function(req, res, next) {
  res.render("404");
  return;
});

module.exports = router;
