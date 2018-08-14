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
        imgPath: "images/exec-images/sbSonali.jpg",
        favQuote: "Magical"
      },
      {
        name: "Vanit Shah",
        position: "Vice President",
        decaEvent: "AAM",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/sbBani.jpg",
        favQuote: "Limitless"
      },
      {
        name: "Maanav Dalal",
        position: "VP of Comms",
        decaEvent: "BSM",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/sbMaanav.jpg",
        favQuote: "Aesthetic"
      },
      {
        name: "Kabisan T.",
        position: "VP of Comms",
        decaEvent: "BSM",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/sbKabisan.jpg",
        favQuote: "Professional"
      },
      {
        name: "Dhvani Doshi",
        position: "VP of Education",
        decaEvent: "BLTDM",
        decaCluster: "Business Admin",
        imgPath: "images/exec-images/sbDhvani.jpg",
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
        name: "Khubi Shah",
        position: "VP of Operations",
        decaEvent: "PFL",
        decaCluster: "Finance",
        imgPath: "images/exec-images/sbKhubi.jpg",
        favQuote: "Exciting"
      },
      {
        name: "Richard Li",
        position: "VP of Finance",
        decaEvent: "PFL",
        decaCluster: "Finance",
        imgPath: "images/exec-images/sbRichard.jpg",
        favQuote: "Invigorating"
      },
    {
      name: "Tanzim Pathan",
      position: "Writtens Director",
      decaEvent: "HTPS",
      decaCluster: "Hospitality",
      imgPath: "images/exec-images/sbTanzim.jpg",
      favQuote: "Memorable"
    },
    {
      name: "Poonum Parmar",
      position: "Business Associate",
      decaEvent: "BOR",
      decaCluster: "Business Admin",
      imgPath: "images/exec-images/sbPoonum.jpg",
      favQuote: "Eye-opening"
    },
    {
      name: "Dalraj Dhillon",
      position: "Business Associate",
      decaEvent: "PMK",
      decaCluster: "Marketing",
      imgPath: "images/exec-images/sbDalraj.jpg",
      favQuote: "Powerful"
    },
    {
      name: "Purva Vyas",
      position: "Business Associate",
      decaEvent: "PMK",
      decaCluster: "Marketing",
      imgPath: "images/exec-images/sbPurva.jpg",
      favQuote: "Mind-Blowing"
    },
      {
        name: "Hina Rani",
        position: "Edu (Marketing)",
        decaEvent: "MCS",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/sbHina.jpg",
        favQuote: "Inspiring"
      },
      {
        name: "Vanit Shah",
        position: "Edu (Principles)",
        decaEvent: "MTDM",
        decaCluster: "Business Admin",
        imgPath: "images/exec-images/sbVanit.jpg",
        favQuote: "Breathtaking"
      },
      {
        name: "Rashi R.",
        position: "Edu (Hospitality)",
        decaEvent: "TTDM",
        decaCluster: "Hospitality",
        imgPath: "images/exec-images/sbRashi.jpg",
        favQuote: "Exhilarating"
      }
  ]

  res.render("landing");
  return;
});

module.exports = router;
