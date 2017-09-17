var User = require("../models/user");

module.exports = function(req, res, next) {
  var studentNumber = req.session.studentNumber;
  if (req.query.studentNumber && req.session.admin) {
    studentNumber = req.query.studentNumber;
  }
  User.getExamResults(studentNumber, function(err, examResults) {
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
