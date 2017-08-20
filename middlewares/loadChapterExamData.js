var Statistics = require("../models/statistics");

module.exports = function(req, res, next) {
  Statistics.getChapterExamResults(function(err, examResults) {
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
