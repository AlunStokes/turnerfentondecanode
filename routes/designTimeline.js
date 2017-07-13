var express = require('express');
var router = express.Router();

//Load default front middlewares
router.use(require("./front"));

//Middlewares
var loadCSS = require("../middlewares/loadCSS");
var loadJS = require("../middlewares/loadJS");
var loadDesignTimeline = require("../middlewares/loadDesignTimeline");

router.use(loadCSS([
  "stylesheets/dist/design-timeline.min.css"
]))
router.use(loadJS([

]))
router.use(loadDesignTimeline);

router.get("/", function(req, res, next) {
  res.render("designTimeline");
  return;
});

module.exports = router;
