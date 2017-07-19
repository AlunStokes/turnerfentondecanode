var express = require("express");
var router = express.Router();

//Load default back middlewares
router.use(require("./back"));

//Middlewares
var loadCSS = require("../middlewares/loadCSS");
var loadJS = require("../middlewares/loadJS");

router.use(loadCSS([
  "stylesheets/dist/timeline.min.css",
  "stylesheets/dist/simplemde.min.css"
]))
router.use(loadJS([
  "js/dist/timeline.min.js",
  "js/dist/simplemde.min.js"
]))

router.get("/", function(req, res, next) {
  res.render("timeline");
});

module.exports = router;
