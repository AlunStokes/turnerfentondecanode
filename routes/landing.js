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
  "https://cdnjs.cloudflare.com/ajax/libs/typeit/4.4.0/typeit.min.js",
  "js/dist/landing.min.js"
]))

router.get("/", function(req, res, next) {
  //Each exec card consists of a name, position, decaEvent, decaCluster, imgPath, numMedals and numPlasbques
  //the execCards array holds all the exec card objects
  res.locals.execCards = [
    {
      name: "Example Name",
      position: "Position",
      decaEvent: "Event",
      decaCluster: "Cluster",
      imgPath: "images/exec-images/anon.jpg",
      favQuote: "Quotation"
    },
  ]

  res.render("landing");
  return;
});

module.exports = router;
