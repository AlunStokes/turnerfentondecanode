var Statistics = require("../models/statistics");

module.exports = function(req, res, next) {
  var examid = req.query.examid;
  if (typeof(examid) == "undefined") {
    examid = -1;
  }
  Statistics.getExamids(function(err, examids) {
    for (var i = 0; i < examids.length; i++) {
      if (examids[i].id == examid) {
        examids[i].selected = true;
      }
    }
    res.locals.examids = examids;
    Statistics.getChapterExamResults(examid, function(err, examResults) {
      if (err) {
        res.locals.errors.push(err);
        next();
        return;
      }
      res.locals.examResults = examResults;
      next();
      return;
    });
  });
}
