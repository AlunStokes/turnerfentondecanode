var express = require("express");
var router = express.Router();

//Load default back middlewares
router.use(require("./front"));

//Middlewares
var loadCSS = require("../middlewares/loadCSS");
var loadJS = require("../middlewares/loadJS");

router.use(loadCSS([
  "stylesheets/dist/login.min.css"
]))
router.use(loadJS([

]))

router.get("/", function(req, res, next) {
  res.render("submitExtension");
});

module.exports = router;
