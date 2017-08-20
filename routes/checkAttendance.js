var express = require("express");
var router = express.Router();

//Load default back middlewares
router.use(require("./back"));

var loadCSS = require("../middlewares/loadCSS");
var loadJS = require("../middlewares/loadJS");
var adminRoute = require("../middlewares/adminRoute");
var loadAttendanceData = require("../middlewares/loadAttendanceData");

router.use(adminRoute);
router.use(loadAttendanceData);
router.use(loadCSS([
  "https://cdn.datatables.net/v/dt/dt-1.10.15/b-1.4.0/b-colvis-1.4.0/b-html5-1.4.0/cr-1.3.3/r-2.1.1/se-1.2.2/datatables.min.css"
]));
router.use(loadJS([
  "https://cdn.datatables.net/v/dt/dt-1.10.15/b-1.4.0/b-colvis-1.4.0/b-html5-1.4.0/cr-1.3.3/r-2.1.1/se-1.2.2/datatables.min.js",
  "js/dist/check-attendance.min.js"
]));

router.get("/", function(req, res, next) {
  res.render("checkAttendance");
});

router.post("/", function(req, res, next) {
  res.redirect("check-attendance");
});

module.exports = router;
