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
  //Each exec card consists of a name, position, decaEvent, decaCluster, imgPath, numMedals and numPlaques
  //the execCards array holds all the exec card objects
  res.locals.execCards = [
    {
        name: "Sonali Puri",
        position: "President",
        decaEvent: "BLTDM",
        decaCluster: "Business Admin",
        imgPath: "images/exec-images/anon.jpg",
      },
      {
        name: "Bani Arora",
        position: "Vice President",
        decaEvent: "AAM",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/anon.jpg",
        numMedals: 0,
        numPlaques: 0
      },
      {
        name: "Maanav Dalal",
        position: "VP of Communications",
        decaEvent: "BSM",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/anon.jpg",
        numMedals: 0,
        numPlaques: 0
      },
      {
        name: "Kabisan Tanedran",
        position: "VP of Communications",
        decaEvent: "BSM",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/anon.jpg",
        numMedals: 0,
        numPlaques: 0
      },
      {
        name: "Dhvani Doshi",
        position: "VP of Education",
        decaEvent: "BLTDM",
        decaCluster: "Business Admin",
        imgPath: "images/exec-images/anon.jpg",
        numMedals: 0,
        numPlaques: 0
      },
      {
        name: "Kavya Kadi",
        position: "VP of Education",
        decaEvent: "BSM",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/Kavya.png",
        numMedals: 0,
        numPlaques: 0
      },
      {
        name: "Khubi Shah",
        position: "VP of Operations",
        decaEvent: "PFL",
        decaCluster: "Finance",
        imgPath: "images/exec-images/anon.jpg",
        numMedals: 0,
        numPlaques: 0
      },
      {
        name: "Richard Li",
        position: "VP of Finance",
        decaEvent: "PFL",
        decaCluster: "Finance",
        imgPath: "images/exec-images/anon.jpg",
        numMedals: 0,
        numPlaques: 0
      },
    {
      name: "Tanzim Pathan",
      position: "Writtens Director",
      decaEvent: "HTPS",
      decaCluster: "Hospitality",
      imgPath: "images/exec-images/anon.jpg",
      numMedals: 0,
      numPlaques: 0
    },
      {
        name: "Hina Rani",
        position: "Edu - Marketing",
        decaEvent: "MCS",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/Hina.png",
        numMedals: 0,
        numPlaques: 0
      },
      {
        name: "Vanit Shah",
        position: "Edu - Business Admin",
        decaEvent: "MTDM",
        decaCluster: "Business Admin",
        imgPath: "images/exec-images/anon.jpg",
        numMedals: 0,
        numPlaques: 0
      },
      {
        name: "Rashi R.",
        position: "Edu - Hospitality",
        decaEvent: "HLM",
        decaCluster: "Hospitality",
        imgPath: "images/exec-images/anon.jpg",
        numMedals: 0,
        numPlaques: 0
      },
      {
        name: "Poonam Parmar",
        position: "Business Associate",
        decaEvent: "PMK",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/anon.jpg",
        numMedals: 0,
        numPlaques: 0
      },
      {
        name: "Dalraj Dhillon",
        position: "Business Associate",
        decaEvent: "PMK",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/anon.jpg",
        numMedals: 0,
        numPlaques: 0
      },
      {
        name: "Purva Vyas",
        position: "Business Associate",
        decaEvent: "PMK",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/Purva.png",
        numMedals: 0,
        numPlaques: 0
      }
  ]

  res.render("landing");
  return;
});

module.exports = router;
