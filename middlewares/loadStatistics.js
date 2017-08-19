var Statistics = require("../models/statistics");

module.exports = function(req, res, next) {
  Statistics.getNumQuestionsAnswered(function(err, numQuestionsAnswered) {
    if (err) {
      res.locals.errors.push(err);
      next();
      return;
    }
    res.locals.numQuestionsAnswered = numQuestionsAnswered;
    next();
    return;
  });
}
