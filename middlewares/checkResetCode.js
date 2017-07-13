var User = require("../models/user");

//Checks the GET parameter resetCode and sees if it matches an open reset ticket
//Sets res.locals.validResetCode to true or false accordingly
module.exports = function(req, res, next) {

  if (req.query.resetCode) {

    var user = {
      resetCode: req.query.resetCode
    }

    User.checkResetCode(user, function(err) {
      if (err) {
        res.locals.errors.push(err);
        next();
        return;
      }
      res.locals.validResetCode = true;
      res.locals.resetCode = user.resetCode;
      next();
      return;
    });
  }
  else {
    next();
  }

}
