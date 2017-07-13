var User = require("../models/user");

//Sends reset code via email and stores code in database
module.exports = function(req, res, next) {
  //If posting new password
  if (req.body.resetCode) {
    //Skip to change password middleware
    next();
    return;
  }

  var user = {
    studentNumber: req.body.studentNumber
  }

  User.sendResetCode(user, function(err) {
    if (err) {
      res.locals.errors.push(err);
      next();
      return;
    }
    res.locals.resetCodeSent = true;
    next();
    return;
  });
}
