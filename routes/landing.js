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
      name: "Mr. Rhoden",
      position: "Chapter Advisor",
      decaEvent: "Teacher",
      decaCluster: "Advisor",
      imgPath: "images/exec-images/sbOmari.jpg",
      favQuote: "Synergy"
    },
    {
        name: "Bani Arora",
        position: "President",
        decaEvent: "BLTDM",
        decaCluster: "Business Admin",
        imgPath: "images/exec-images/bani.jpg",
        favQuote: "Limitless"
      },
      {
        name: "Vanit Shah",
        position: "Vice President",
        decaEvent: "AAM",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/vanit.jpg",
        favQuote: "Limitless"
      },
      {
        name: "Aashna Agarwal",
        position: "VP of Comms",
        decaEvent: "BFS",
        decaCluster: "Finance",
        imgPath: "images/exec-images/aashna.jpg",
        favQuote: "Memorable"
      },
      {
        name: "Kabisan T.",
        position: "VP of Comms",
        decaEvent: "BSM",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/kabi.jpg",
        favQuote: "Professional"
      },
      {
        name: "Purva Vyas",
        position: "VP of Education",
        decaEvent: "BLTDM",
        decaCluster: "Business Admin",
        imgPath: "images/exec-images/sbPurva.jpg",
        favQuote: "Growth"
      },
      {
        name: "Kavya Kadi",
        position: "VP of Education",
        decaEvent: "MCS",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/sbKavya.jpg",
        favQuote: "Life-Changing"
      },
      {
        name: "Anish Mahto",
        position: "VP of Education",
        decaEvent: "PFL",
        decaCluster: "Finance",
        imgPath: "images/exec-images/anish.jpg",
        favQuote: "Exciting"
      },
      {
        name: "Richard Li",
        position: "VP of Finance",
        decaEvent: "PFL",
        decaCluster: "Finance",
        imgPath: "images/exec-images/richard.jpg",
        favQuote: "Invigorating"
      },
    {
      name: "Hannah Tang",
      position: "VP of Finance",
      decaEvent: "HTPS",
      decaCluster: "Hospitality",
      imgPath: "images/exec-images/sbTanzim.jpg",
      favQuote: "Memorable"
    },
    {
      name: "Sharon Chatha",
      position: "Writtens Director",
      decaEvent: "BOR",
      decaCluster: "Business Admin",
      imgPath: "images/exec-images/sbDalraj.jpg",
      favQuote: "Eye-opening"
    },
    {
      name: "Poonum Parmar",
      position: "Writtens Director",
      decaEvent: "PMK",
      decaCluster: "Marketing",
      imgPath: "images/exec-images/sbPoonum.jpg",
      favQuote: "Powerful"
    },
    {
      name: "Jai Betala",
      position: "Business Associate",
      decaEvent: "PMK",
      decaCluster: "Marketing",
      imgPath: "images/exec-images/sbPurva.jpg",
      favQuote: "Mind-Blowing"
    },
      {
        name: "Arnav Paruthi",
        position: "Business Associate",
        decaEvent: "MCS",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/arnav.jpg",
        favQuote: "Inspiring"
      },
      {
        name: "Yasmine Ahmed",
        position: "Business Associate",
        decaEvent: "MTDM",
        decaCluster: "Business Admin",
        imgPath: "images/exec-images/sbVanit.jpg",
        favQuote: "Breathtaking"
      },
      
  ]

  res.render("landing");
  return;
});

module.exports = router;
