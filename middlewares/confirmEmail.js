var User = require("../models/user")

module.exports = function(req, res, next) {

  //If no confirmation code is given
  if (!req.query.confirmEmailCode) {
    next();
    return;
  }

  var user = {
    confirmEmailCode: req.query.confirmEmailCode
  }

  User.confirmEmail(user, function(err) {
    if (err) {
      res.locals.errors.push(err);
      next();
      return;
    }
    res.locals.emailConfirmed = true;
    next();
    return;
  });
}
