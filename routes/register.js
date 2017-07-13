var express = require('express');
var router = express.Router();

//Load default front middlewares
router.use(require("./front"));

//Middlewares
var loadCSS = require("../middlewares/loadCSS");
var loadJS = require("../middlewares/loadJS");
var getRegisterOpen = require("../middlewares/getRegisterOpen");
var validateRegistration = require("../middlewares/validateRegistration");
var confirmEmail = require("../middlewares/confirmEmail");

router.use(loadCSS([
  "stylesheets/dist/register.min.css"
]));
router.use(loadJS([
  "js/dist/validator.min.js",
  "js/dist/register.min.js"
]));
router.use(getRegisterOpen);

router.get("/", confirmEmail, function(req, res, next) {
  if (res.locals.emailConfirmed) {
    res.render("registerEmailConfirmSuccess");
    return;
  }
  res.render("register");
});

router.post("/", validateRegistration, function(req, res, next) {
  if (res.locals.validRegistration) {
    res.render("registerSuccess");
    return;
  }
  res.render("register");
});

module.exports = router;
