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
  "js/dist/jquery.min.js"
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

//404 error
router.use(require("./404"));

module.exports = router;
