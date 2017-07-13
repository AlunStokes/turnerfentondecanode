var User = require("../models/user");

//Updates password based on reset code
module.exports = function(req, res, next) {

  //If sendResetCode either sent a code or came up with an error
  if (res.locals.errors.length > 0 || res.locals.resetCodeSent) {
    next();
    return;
  }

  var resetCode = req.body.resetCode;
  var password = req.body.password;
  var passwordConfirm = req.body.passwordConfirm

  //Do passwords match
  if (password != passwordConfirm) {
    res.locals.errors.push("Passwords do not match");
    next();
    return;
  }
  //Is password long enough
  else if (password.length < 8) {
    res.locals.errors.push("Password is fewer than 8 characters");
    next();
    return;
  }

  var user = {
    password: password,
    resetCode: resetCode
  };

  User.setPassword(user, function(err) {
    if (err) {
      res.locals.errors.push("Server error - try again later");
      next();
      return;
    }
    res.locals.passwordUpdated = true;
    next();
    return;
  });
}
