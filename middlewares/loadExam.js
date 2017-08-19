var Exam = require("../models/Exam");

module.exports = function(req, res, next) {
  if (req.body.cluster) {
    var numQuestions = req.body.numQuestions;
    var cluster = req.body.cluster;
    var timer = req.body.timer == 1 ? 1 : 0;
    res.locals.examTimer = timer;
    res.locals.examTimeLimit = numQuestions * 0.75 * 60;
    Exam.loadRandomExam(cluster, numQuestions, function(err, mod, increment, seed, multiplier, offset, exam) {
      if(err) {
        res.locals.errors.push("Server error- try again later");
        next();
        return;
      }
      //Add exam data to res.locals object
      //THIS IS HOW THE EXAM IS LOADED
      res.locals.exam = exam;
      var examData = {
        mod: mod,
        increment: increment,
        seed: seed,
        multiplier: multiplier,
        offset: offset,
        numQuestions: numQuestions,
        cluster: cluster
      };
      Exam.startExam(req.session.studentNumber, examData, function(err, examHash) {
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
  }
  else {
    var examid = parseInt(req.body.examid, 10);
    Exam.checkExamUnlocked(examid, function(err, unlocked) {
      if (err) {
        res.locals.errors.push(err);
        next();
        return;
      }
      if (!unlocked && !req.session.admin) {
        next();
        return;
      }
      Exam.checkShowTimer(examid, function(err, showTimer) {
        if (err) {
          res.locals.errors.push(err);
          next();
          return;
        }
        res.locals.examTimer = showTimer;
        Exam.loadExam(examid, function(err, exam) {
          if (err) {
            res.locals.errors.push(err);
            next();
            return;
          }
          res.locals.examTimeLimit = exam.length * 0.75 * 60;
          res.locals.exam = exam;
          Exam.startExam(req.session.studentNumber, examid, function(err, examHash) {
            if(err) {
              res.locals.errors.push(err);
              next();
              return;
            }
            req.session.examHash = examHash;
            next();
            return;
          });
        });
      });
    });
  }
}
