var User = require("../models/user");

module.exports = function(req, res, next) {
  User.getUsers(function(err, users) {
    if (err) {
      res.locals.errors.push(err);
      next();
      return;
    }
    res.locals.users = users;
    next();
    return;
  });
}
