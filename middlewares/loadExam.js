var Exam = require("../models/Exam");

module.exports = function(req, res, next) {
  /*
  if (req.session.examHash) {
    Exam.resumeExam(req.session.examHash, function(exam) {
      res.locals.exam = exam;
      next();
      return;
    });
  }
  */

  //else {
    //Loads exam data
    var numQuestions = 100;
    var cluster = req.body.cluster;
    Exam.loadRandomExam(cluster, numQuestions, function(err, mod, increment, seed, multiplier, offset, exam) {
      if(err) {
        res.locals.errors.push("Server error- try again later");
        next();
        return;
      }
      res.locals.exam = exam;
      Exam.startExam(req.session.studentNumber, mod, increment, seed, multiplier, offset, numQuestions, cluster, function(err, examHash) {
        if(err) {
          res.locals.errors.push("Server error- try again later");
          next();
          return;
        }
        //Used to identify exam session
        req.session.examHash = examHash;
        next();
        return;
      });
    });
  //}

}
