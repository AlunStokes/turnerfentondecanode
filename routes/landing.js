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
      name: "Exec Member",
      position: "Executive Position",
      decaEvent: "DECA Event",
      decaCluster: "DECA Cluster",
      imgPath: "images/exec-images/anon.jpg",
      numMedals: 10,
      numPlaques: 3
    },
    {
      name: "Exec Member",
      position: "Executive Position",
      decaEvent: "DECA Event",
      decaCluster: "DECA Cluster",
      imgPath: "images/exec-images/anon.jpg",
      numMedals: 6,
      numPlaques: 1
    },
    {
      name: "Exec Member",
      position: "Executive Position",
      decaEvent: "DECA Event",
      decaCluster: "DECA Cluster",
      imgPath: "images/exec-images/anon.jpg",
      numMedals: 8,
      numPlaques: 3
    },
    {
      name: "Exec Member",
      position: "Executive Position",
      decaEvent: "DECA Event",
      decaCluster: "DECA Cluster",
      imgPath: "images/exec-images/anon.jpg",
      numMedals: 8,
      numPlaques: 2
    },
    {
      name: "Exec Member",
      position: "Executive Position",
      decaEvent: "DECA Event",
      decaCluster: "DECA Cluster",
      imgPath: "images/exec-images/anon.jpg",
      numMedals: 12,
      numPlaques: 2
    },
  ]

  res.render("landing");
  return;
});

module.exports = router;
