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
    },
    {
      name: "Arooba Muhammad",
      position: "VP of Education",
      decaEvent: "Professional Selling",
      decaCluster: "Marketing",
      imgPath: "images/exec-images/arooba.jpg",
      numMedals: 6,
      numPlaques: 1
    },
    {
      name: "Saba Manzoor",
      position: "Writtens Director",
      decaEvent: "Fashion Merchandising Promotional Plan",
      decaCluster: "Marketing",
      imgPath: "images/exec-images/saba.jpg",
      numMedals: 8,
      numPlaques: 3
    },
    {
      name: "Zoey Aliasgari",
      position: "President",
      decaEvent: "Hospitality Event",
      decaCluster: "Hospitality & Tourism",
      imgPath: "images/exec-images/zoey.jpg",
      numMedals: 8,
      numPlaques: 2
    },
    {
      name: "Pranjan Gandhi",
      position: "Vice-President",
      decaEvent: "Marketing Event",
      decaCluster: "Marketing",
      imgPath: "images/exec-images/pranjan.jpg",
      numMedals: 12,
      numPlaques: 2
    },
  ]

  res.render("landing");
  return;
});

module.exports = router;
