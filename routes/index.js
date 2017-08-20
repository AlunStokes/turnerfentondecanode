var express = require('express');
var router = express.Router();


//Middle
router.use("/ajax", require("./ajax"));
router.use("/logout", require("./logout"));


//Middlewares
var setDefaultVariables = require("../middlewares/setDefaultVariables");
var loadCSS = require("../middlewares/loadCSS");
var loadJS = require("../middlewares/loadJS");

//Instatiate default variables on res.locals
router.use(setDefaultVariables);
router.use(loadCSS([
  "stylesheets/dist/bootstrap.min.css"
]));
router.use(loadJS([
  "https://code.jquery.com/jquery-3.2.1.min.js"
]));

//Redirect root route
router.get("/", function(req,res, next) {
  res.redirect("landing");
});

//Front
router.use("/landing", require("./landing"));
router.use("/design-timeline", require("./designTimeline"));
router.use("/login", require("./login"));
router.use("/register", require("./register"));
router.use("/reset-password", require("./resetPassword"));
router.use("/submit-extension", require("./submitExtension"));

//Back
router.use("/home", require("./home"));
router.use("/timeline", require("./timeline"));
router.use("/practice", require("./practice"));
router.use("/personal-exam-statistics", require("./personalExamStatistics"));
router.use("/chapter-exam-statistics", require("./chapterExamStatistics"));
router.use("/exam", require("./exam"));
router.use("/create-exam", require("./createExam"));
router.use("/add-question", require("./addQuestion"));
router.use("/attendance", require("./attendance"));
router.use("/check-attendance", require("./checkAttendance"));
router.use("/account", require("./account"));

//404 error
router.use(require("./404"));

module.exports = router;
