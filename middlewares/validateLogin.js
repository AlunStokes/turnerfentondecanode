var User = require("../models/user");

module.exports = function(req, res, next) {

  var user = {
    studentNumber: req.body.studentNumber,
    password: req.body.password
  }

  User.login(user, function(err) {
      if (!err) {
        res.locals.validLogin = true;
        next();
        return;
      }
      else {
        res.locals.errors.push(err);
        next();
        return;
      }
    });

}
