var express = require('express');
var router = express.Router();

//Load default front middlewares
router.use(require("./front"));

//Middlewares
var loadCSS = require("../middlewares/loadCSS");
var loadJS = require("../middlewares/loadJS");
var validateLogin = require("../middlewares/validateLogin");
var addUserSession = require("../middlewares/addUserSession");

router.use(loadCSS([
  "stylesheets/dist/login.min.css"
]))
router.use(loadJS([
  "js/dist/login.min.js"
]))

router.get("/", function(req, res, next) {
  if (req.session.studentNumber) {
    res.redirect("home");
    return;
  }
  res.render("login");
  return;
});

router.post("/", validateLogin, addUserSession, function(req, res, next) {
  if (res.locals.validLogin) {
    res.redirect("home");
    return;
  }
  else {
    res.render("login");
    return;
  }
});

module.exports = router;
