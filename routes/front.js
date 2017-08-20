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
  "stylesheets/dist/front.min.css"
]));
router.use(loadJS([
  "https://cdnjs.cloudflare.com/ajax/libs/headroom/0.9.4/headroom.js",
  "js/dist/front.min.js"
]));

module.exports = router;
