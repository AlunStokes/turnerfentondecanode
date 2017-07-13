var express = require('express');
var router = express.Router();

//Load default front middlewares
router.use(require("./front"));

//Middlewares
var loadCSS = require("../middlewares/loadCSS");
var loadJS = require("../middlewares/loadJS");

router.use(loadCSS([
  "stylesheets/dist/landing.min.css"
]))
router.use(loadJS([
  "js/dist/typeit.min.js",
  "js/dist/landing.min.js"
]))

router.get("/", function(req, res, next) {
  //Each exec card consists of a name, position, decaEvent, decaCluster, imgPath, numMedals and numPlaques
  //the execCards array holds all the exec card objects
  res.locals.execCards = [
    {
      name: "Alun Stokes",
      position: "VP of Communications",
      decaEvent: "Fashion Merchandising Promotional Plan",
      decaCluster: "Marketing",
      imgPath: "images/exec-images/alun.jpg",
      numMedals: 10,
      numPlaques: 3
    }
  ]

  res.render("landing");
  return;
});

module.exports = router;
