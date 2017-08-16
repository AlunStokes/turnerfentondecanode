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
var getUserSettings = require("../middlewares/getUserSettings");

router.use(auth(true));
router.use(getUserSettings);
router.use(setLayout("back"));
router.use(loadNavbar("back"));
router.use(loadTitle);
router.use(loadCSS([
  "stylesheets/dist/bootstrap.min.css",
  "stylesheets/dist/animate.min.css",
  "stylesheets/dist/dashboard.min.css"
]));
router.use(loadJS([
  "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.1/socket.io.slim.js",
  "js/dist/bootstrap.min.js",
  "js/dist/bootstrap-notify.min.js",
  //"js/dist/bootstrap-checkbox-radio.min.js",
  "js/dist/dashboard.min.js",
  "js/dist/chartist.min.js",
  "js/dist/jscolor.min.js",
  "js/dist/keep-alive.min.js",
  "https://use.fontawesome.com/4a55e6f24a.js"
]));


module.exports = router;
