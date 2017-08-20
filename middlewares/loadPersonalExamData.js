var User = require("../models/user");

module.exports = function(req, res, next) {
  User.getExamResults(req.session.studentNumber, function(err, examResults) {
    if (err) {
      res.locals.errors.push(err);
      next();
      return;
    }
    res.locals.examResults = examResults;
    next();
    return;
  });
}
