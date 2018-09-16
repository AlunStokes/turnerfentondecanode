var express = require("express");
var router = express.Router();

//Load default back middlewares
router.use(require("./back"));

var loadCSS = require("../middlewares/loadCSS");
var loadJS = require("../middlewares/loadJS");
var loadChapterExamData = require("../middlewares/loadChapterExamData");
var adminRoute = require("../middlewares/adminRoute");

router.use(adminRoute);
router.use(loadChapterExamData);
router.use(loadCSS([
  "https://cdn.datatables.net/v/bs/jszip-2.5.0/dt-1.10.16/b-1.4.2/b-colvis-1.4.2/b-html5-1.4.2/cr-1.4.1/fh-3.1.3/r-2.2.0/rg-1.0.2/sc-1.4.3/sl-1.2.3/datatables.min.css"
]));
router.use(loadJS([
  "https://cdn.datatables.net/v/bs/jszip-2.5.0/dt-1.10.16/b-1.4.2/b-colvis-1.4.2/b-html5-1.4.2/cr-1.4.1/fh-3.1.3/r-2.2.0/rg-1.0.2/sc-1.4.3/sl-1.2.3/datatables.min.js",
  "js/src/chapter-exam-statistics.js"
]));

router.get("/", function(req, res, next) {
  res.render("chapterExamStatistics");
});

router.post("/", function(req, res, next) {
  res.redirect("chapter-exam-statistics");
});

module.exports = router;
