//Gets the set color preferences for a user and adds to the res.locals object
//Colors are loaded to page via inline styles on the layoutBack template
var User = require("../models/user");

module.exports = function(req, res, next) {

  var user = {
    studentNumber: req.session.studentNumber
  }

  User.getUserSettings(user, function(err, settings) {
    if (err) {
      res.locals.errors.push("Could not load user settings");
      next();
      return;
    }
    Object.assign(res.locals, settings);
    next();
  });
}
