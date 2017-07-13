var express = require('express');
var router = express.Router();

//Load default front middlewares
router.use(require("./front"));

//Middlewares
var loadCSS = require("../middlewares/loadCSS");
var loadJS = require("../middlewares/loadJS");
var checkResetCode = require("../middlewares/checkResetCode");
var sendResetCode = require("../middlewares/sendResetCode");
var setPassword = require("../middlewares/setPassword");

router.use(loadCSS([
  "stylesheets/dist/reset-password.min.css"
]));
router.use(loadJS([
  "js/dist/reset-password.min.js"
]));

router.get("/", checkResetCode, function(req, res, next) {
  if (res.locals.validResetCode) {
    //Reset code is valid
    res.render("resetPasswordForm");
    return;
  }
  //Reset code is not provided or invalid
  res.render("resetPasswordRequest");
});

router.post("/", sendResetCode, setPassword, function(req, res, next) {
  if (req.body.resetCode) {
    if (res.locals.passwordUpdated) {
      //Password updated succeeded
      res.render("resetPasswordSuccess");
      return;
    }
    //Password update failed
    //Passes reset code to be inserted in page
    res.locals.resetCode = req.body.resetCode
    res.render("resetPasswordForm");
    return;
  }
  if (res.locals.resetCodeSent) {
    //Password reset code was sent
    res.render("resetPasswordSent");
    return;
  }
  //Password reset code failed to be sent
  res.render("resetPasswordRequest");
});

module.exports = router;
