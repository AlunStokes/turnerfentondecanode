var User = require("../models/user");

module.exports = function(req, res, next) {
  if (res.locals.validLogin) {
    var user = {
      studentNumber: req.body.studentNumber
    }
    User.addSession(user, function(err, user) {
      Object.assign(req.session, user);
      next();
      return;
    });
  }
  else {
    next();
  }
}
