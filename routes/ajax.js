var express = require('express');
var router = express.Router();

var db = require("../db");

//Models
var Statistics = require("../models/statistics");
var Utilities = require("../models/utilities");
var Exam = require("../models/exam");

router.get("/", function(req, res, next) {

  db.pool.getConnection(function(err, connection) {
    switch(req.query.ajaxid) {
      case "questionsAnswered":
      Statistics.getNumQuestionsAnswered(function(err, numQuestionsAnswered) {
        if (!err) {
          res.send({
            numQuestionsAnswered: numQuestionsAnswered
          });
        }
        else {
          err: "Server error"
        }
      });
      break;

      case "getTFDExtensions":
      connection.query("SELECT extension FROM tfdextensions WHERE approved = 1 ORDER BY RAND() LIMIT 10", function(err, rows, fields) {
        var extensions = [];
        for (var i = 0; i < rows.length; i++) {
          extensions.push(rows[i].extension)
        }
        res.json(extensions);
      });
      break;


      case "allowSubmitExtensions":
      connection.query("UPDATE membersettings SET canSubmitExtensions = 1 WHERE studentNumber = ?", [req.session.studentNumber], function(err, rows, fields) {
        if (rows.affectedRows != 1) {
          res.json({err: "Server error - try again later"});
        }
        else {
          res.json({err: false});
        }
      });
      break;


      case "checkAllowedSubmitExtensions":
      connection.query("SELECT canSubmitExtensions FROM membersettings WHERE studentNumber = ?", [req.session.studentNumber], function(err, rows, fields) {
        if (err) {
          res.json({err: "Server error - try again later"});
        }
        else {
          res.json({canSubmitExtensions: rows[0].canSubmitExtensions == 1});
        }
      });
      break;


      case "checkIncompleteExam":
      if (req.session.examHash) {
        res.json({
          examStarted: true
        });
      }
      else {
        res.json({
          examStarted: false
        });
      }
      break;

      case "removeIncompleteExam":
      connection.query("UPDATE examresults SET cancelled = 1 WHERE examHash = ?", [req.session.examHash], function(err, rows, fields) {
        if (err) {
          res.json({
            err: "Server error - try again later"
          });
        }
        req.session.examHash = null;
        res.json({
          err: null
        });
      });
      break;


      case "getQuestionList":
      var cluster = req.query.cluster;
      var offset = parseInt(req.query.offset);
      var questionsPer = parseInt(req.query.questionsPer);
      var search = "%" + req.query.search + "%";
      var questions = [];
      if (cluster == "mix") {
        connection.query("SELECT questions.questionid, question, optionA, optionB, optionC, optionD, answer FROM questions LEFT JOIN questionoptions ON questionoptions.questionid = questions.questionid LEFT JOIN questionanswers ON questionanswers.questionid = questions.questionid LEFT JOIN questionclusters ON questionclusters.questionid = questions.questionid WHERE question LIKE ? OR optionA LIKE ? OR optionB LIKE ? OR optionC LIKE ? OR optionD LIKE ? LIMIT ? OFFSET ?", [search, search, search, search, search, questionsPer, offset], function(err, rows, fields) {
          for (var i = 0; i < rows.length; i++) {
            questions.push({
              questionid: rows[i].questionid,
              question: rows[i].question,
              optionA: rows[i].optionA,
              optionB: rows[i].optionB,
              optionC: rows[i].optionC,
              optionD: rows[i].optionD,
              answer: rows[i].answer
            });
          }
          res.json(questions);
        });
      }
      else {
        connection.query("SELECT questions.questionid, question, optionA, optionB, optionC, optionD, answer FROM questions LEFT JOIN questionoptions ON questionoptions.questionid = questions.questionid LEFT JOIN questionanswers ON questionanswers.questionid = questions.questionid LEFT JOIN questionclusters ON questionclusters.questionid = questions.questionid WHERE cluster = ? AND (question LIKE ? OR optionA LIKE ? OR optionB LIKE ? OR optionC LIKE ? OR optionD LIKE ?) LIMIT ? OFFSET ?", [cluster, search, search, search, search, search, questionsPer, offset], function(err, rows, fields) {
          for (var i = 0; i < rows.length; i++) {
            questions.push({
              questionid: rows[i].questionid,
              question: rows[i].question,
              optionA: rows[i].optionA,
              optionB: rows[i].optionB,
              optionC: rows[i].optionC,
              optionD: rows[i].optionD,
              answer: rows[i].answer
            });
          }
          res.json(questions);
        });
      }
      break;


      default:
      res.send({
        err: "No valid ajax id defined"
      });


    }
    connection.release();
  });
  return;
});


router.post("/", function(req, res, next) {

  db.pool.getConnection(function(err, connection) {
    switch(req.body.ajaxid) {


      case "getTimelineData":
      var firstIndex = parseInt(req.body.firstIndex);
      var limit = parseInt(req.body.limit);
      var offset = parseInt(req.body.offset);
      connection.query("SELECT timeline.id, timeline.messageHTML, timeline.messageMarkdown, DATE_FORMAT(timeline.date, '%M %D %Y') as date, DATE_FORMAT(timeline.date, '%H:%i') as time, members.firstName as posterFirstName, members.lastName as posterLastName, timeline.poster as posterStudentNumber, timeline.class FROM timeline JOIN members ON members.studentNumber = timeline.poster ORDER BY UNIX_TIMESTAMP(timeline.date) DESC LIMIT ? OFFSET ?", [limit, offset], function(err, rows, fields) {
        res.json(rows);
      });
      break;


      case "submitNewPost":
      if (!req.session.admin) {
        res.json({
          err: "Requires administrative privileges"
        });
        return;
      }
      var messageHTML = req.body.messageHTML;
      var messageMarkdown = req.body.messageMarkdown;
      var poster = req.session.studentNumber;
      var messageClass = req.body.messageClass;
      connection.query("INSERT INTO timeline (poster, messageHTML, messageMarkdown, class) VALUES (?, ?, ?, ?)", [poster, messageHTML, messageMarkdown, messageClass], function(err, rows, fields) {
        if (err) {
          res.json({
            err: "Server error - try again later"
          });
        }
        else{
          res.json({
            err: null
          });
        }
      });
      break;

      case "updatePost":
      if (!req.session.admin) {
        res.json({
          err: "Requires administrative privileges"
        });
        return;
      }
      var messageHTML = req.body.messageHTML;
      var messageMarkdown = req.body.messageMarkdown;
      var messageClass = req.body.messageClass;
      var postid = req.body.postid;
      connection.query("UPDATE timeline SET messageHTML = ?, messageMarkdown = ?, class = ? WHERE id = ?", [messageHTML, messageMarkdown, messageClass, postid], function(err, rows, fields) {
        if (err) {
          console.log(err);
          res.json({
            err: "Post not updated - try again later"
          });
        }
        else {
          res.json({
            err: null
          });
        }
      });
      break;

      case "deletePost":
      if (!req.session.admin) {
        res.json({
          err: "Requires administrative privileges"
        });
        return;
      }
      var postid = req.body.postid;
      connection.query("DELETE FROM timeline WHERE id = ?", [postid], function(err, rows, fields) {
        if (rows.affectedRows == 1) {
          res.json({
            err: null
          });
          return;
        }
        else {
          res.json({
            err: "Could not delete post"
          });
          return;
        }
      });
      break;

      //Add error checking
      case "checkExam":
      var givenAnswers = JSON.parse(req.body.givenAnswers);
      connection.query("SELECT modulus, increment, seed, multiplier, offset FROM examresults WHERE examHash = ?", [req.session.examHash], function(err, rows, fields) {
        Utilities.linConGen(rows[0].modulus, rows[0].increment, rows[0].seed, rows[0].multiplier, givenAnswers.length, rows[0].offset, function(questionList) {
          connection.query("SELECT answer FROM questionanswers WHERE questionid IN (" + questionList.join() + ") ORDER BY FIND_IN_SET(questionid, '" + questionList.join() + "')", function(err, rows, fields) {
            var answers = [];
            var numCorrect = 0
            for (var i = 0; i < rows.length; i++) {
              answers[i] = rows[i].answer;
              if (givenAnswers[i] == answers[i]) {
                numCorrect++;
              }
            }
            Exam.saveExam(req.session.examHash, numCorrect, function(err) {
              req.session.examHash = null;
              if (!err) {
                res.json({
                  answers: answers
                });
              }
              else {
                res.json({
                  err: "Server error - try again later"
                });
              }
            });
          });
        });
      });
      break;

      case "createExam":
      var examName = req.body.examName;
      var examCluster = req.body.examCluster;
      var examShowScore = JSON.parse(req.body.examShowScore) ? 1 : 0;
      var examUnlocked = JSON.parse(req.body.examUnlocked) ? 1 : 0;
      var examQuestions = JSON.parse(req.body.examQuestions);
      connection.query("SELECT name FROM createdexams WHERE name = ?", [examName], function(err, rows, fields) {
        if (rows.length != 0) {
          res.json({
            err: "Exam with same name already exists"
          });
          return;
        }
        connection.query("INSERT INTO createdexams (name, numQuestions, cluster, unlocked, showScore) VALUES (?, ?, ?, ?, ?);", [examName, examQuestions.length, examCluster, examUnlocked, examShowScore], function(err, rows, fields) {
          if (err) {
            connection.release();
            res.json({
              err: "Serer error - exam not created"
            });
            return;
          }
          var insertArray = [];
          for (var i = 0; i < examQuestions.length; i++) {
            insertArray.push([rows.insertId, examQuestions[i]]);
          }
          connection.query("INSERT INTO createdexamquestions (examid, questionid) VALUES ?", [insertArray], function(err, rows, fields) {
            connection.release();
            if (err) {
              res.json({
                err: "Serer error - exam not created"
              });
              return;
            }
            res.json({
              err: null
            });
          });
        });
      });
      break;

      case "submitExtension":
      var extension = req.body.extension;
      connection.query("INSERT INTO tfdextensions (extension, author) VALUES (?, ?)", [extension, req.session.studentNumber], function(err, rows, fields) {
        if (err) {
          if(err.code == "ER_DUP_ENTRY") {
            res.json({
              duplicate: true
            });
          }
          else {
            res.json({
              err: "Server error - try again later"
            });
          }
        }
        else {
          res.json({
            err: false
          });
        }
      });
      break;


      default:


    }
    connection.release();
  });
  return;
});

module.exports = router;
