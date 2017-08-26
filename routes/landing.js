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
        favQuote: "Hi"
      },
      {
        name: "Bani Arora",
        position: "Vice President",
        decaEvent: "AAM",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/anon.jpg",
        favQuote: "-"
      },
      {
        name: "Maanav Dalal",
        position: "VP of Comms",
        decaEvent: "BSM",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/anon.jpg",
        favQuote: "-"
      },
      {
        name: "Kabisan Tanedran",
        position: "VP of Comms",
        decaEvent: "BSM",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/anon.jpg",
        favQuote: "-"
      },
      {
        name: "Dhvani Doshi",
        position: "VP of Education",
        decaEvent: "BLTDM",
        decaCluster: "Business Admin",
        imgPath: "images/exec-images/anon.jpg",
        favQuote: "Growth"
      },
      {
        name: "Kavya Kadi",
        position: "VP of Education",
        decaEvent: "MCS",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/Kavya.png",
        favQuote: "Life-Changing"
      },
      {
        name: "Khubi Shah",
        position: "VP of Operations",
        decaEvent: "PFL",
        decaCluster: "Finance",
        imgPath: "images/exec-images/anon.jpg",
        favQuote: "-"
      },
      {
        name: "Richard Li",
        position: "VP of Finance",
        decaEvent: "PFL",
        decaCluster: "Finance",
        imgPath: "images/exec-images/anon.jpg",
        favQuote: "-"
      },
    {
      name: "Tanzim Pathan",
      position: "Writtens Director",
      decaEvent: "HTPS",
      decaCluster: "Hospitality",
      imgPath: "images/exec-images/anon.jpg",
      favQuote: "Memorable"
    },
      {
        name: "Hina Rani",
        position: "Edu (Marketing)",
        decaEvent: "MCS",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/Hina.png",
        favQuote: "Inspiring"
      },
      {
        name: "Vanit Shah",
        position: "Edu (Biz Admin)",
        decaEvent: "MTDM",
        decaCluster: "Business Admin",
        imgPath: "images/exec-images/anon.jpg",
        favQuote: "-"
      },
      {
        name: "Rashi R.",
        position: "Edu (Hospitality)",
        decaEvent: "TTDM",
        decaCluster: "Hospitality",
        imgPath: "images/exec-images/anon.jpg",
        favQuote: "-"
      },
      {
        name: "Poonam Parmar",
        position: "Business Associate",
        decaEvent: "PMK",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/anon.jpg",
        favQuote: "-"
      },
      {
        name: "Dalraj Dhillon",
        position: "Business Associate",
        decaEvent: "PMK",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/anon.jpg",
        favQuote: "-"
      },
      {
        name: "Purva Vyas",
        position: "Business Associate",
        decaEvent: "PMK",
        decaCluster: "Marketing",
        imgPath: "images/exec-images/Purva.png",
        favQuote: "-"
      }
  ]

  res.render("landing");
  return;
});

module.exports = router;
