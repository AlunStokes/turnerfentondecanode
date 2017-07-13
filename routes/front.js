var express = require('express');
var router = express.Router();

//Middlewares
//Loads navigation bar
var loadNavbar = require("../middlewares/loadNavbar");
//Loads title of webpage - must come after loadNavbar
var loadTitle = require("../middlewares/loadTitle");
//Sets default handlebars layout for route
var setLayout = require("../middlewares/setLayout");
var loadCSS = require("../middlewares/loadCSS");
var loadJS = require("../middlewares/loadJS");
var auth = require("../middlewares/auth");

router.use(auth(false));
router.use(setLayout("front"));
router.use(loadNavbar("front"));
router.use(loadTitle);
router.use(loadCSS([
  "stylesheets/dist/headroom.min.css"
]));
router.use(loadJS([
  "js/dist/headroom.min.js",
  "js/dist/front.min.js"
]));

module.exports = router;
