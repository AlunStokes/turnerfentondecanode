var express = require('express');
var router = express.Router();

var db = require("../db");

//Models
var Statistics = require("../models/statistics");
var Utilities = require("../models/utilities");
var Exam = require("../models/exam");
var User = require("../models/user");

router.get("/", function(req, res, next) {

  if (!req.query.ajaxid) {
    res.redirect("login");
    return;
  }

  db.pool.getConnection(function(err, connection) {
    if (err) {
      res.json({
        err: "Cannot connect to database"
      });
      return;
    }

    switch(req.query.ajaxid) {
      case "questionsAnswered":
      Statistics.getNumQuestionsAnswered(function(err, numQuestionsAnswered) {
        if (!err) {
          res.send({
            numQuestionsAnswered: numQuestionsAnswered
          });
          return;
        }
        res.send({
          err: "Sever error"
        });
        return;
      });
      break;

      case "getTFDExtensions":
      connection.query("SELECT extension FROM tfdextensions WHERE approved = 1 ORDER BY RAND() LIMIT 10", function(err, rows, fields) {
        if (err) {
          res.json({
            err: "Couldn't load extensions"
          });
          return;
        }
        var extensions = [];
        for (var i = 0; i < rows.length; i++) {
          extensions.push(rows[i].extension)
        }
        res.json({
          err: null,
          extensions: extensions
        });
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

      case "canSearchQuestions":
      connection.query("SELECT value FROM websiteSettings WHERE setting = ?", ["searchQuestionsOpen"], function(err, rows, fields) {
        if (err) {
          res.json({
            err: "Server error"
          });
          return;
        }
        res.json({
          err: null,
          canSearchQuestions: rows[0].value == 1 ? true : false
        });
        return;
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
          if (err) {
            res.json({
              err: err
            });
            return;
          }
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
          connection.release();
          res.json(questions);
        });
      }
      else {
        connection.query("SELECT questions.questionid, question, optionA, optionB, optionC, optionD, answer FROM questions LEFT JOIN questionoptions ON questionoptions.questionid = questions.questionid LEFT JOIN questionanswers ON questionanswers.questionid = questions.questionid LEFT JOIN questionclusters ON questionclusters.questionid = questions.questionid WHERE cluster = ? AND (question LIKE ? OR optionA LIKE ? OR optionB LIKE ? OR optionC LIKE ? OR optionD LIKE ?) LIMIT ? OFFSET ?", [cluster, search, search, search, search, search, questionsPer, offset], function(err, rows, fields) {
          if (err) {
            res.json({
              err: err
            });
            return;
          }
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
          connection.release();
          res.json(questions);
        });
      }
      break;

      case "searchExams":
      var cluster = req.query.cluster;
      var search = '%' + req.query.search + '%';
      var offset = parseInt(req.query.offset);
      var examsPer = parseInt(req.query.examsPer);

      var exams = [];
      if (cluster == "mix") {
        connection.query("SELECT id, name, numQuestions, cluster, DATE_FORMAT(dateCreated, '%M %D %Y') as date, unlocked, showScore FROM createdexams WHERE name LIKE ? ORDER BY dateCreated DESC LIMIT ? OFFSET ?;", [search, examsPer, offset], function(err, rows, fields) {
          connection.release();
          if (err) {
            res.json({
              err: err
            });
            return;
          }
          for (var i = 0; i < rows.length; i++) {
            exams.push(
              {
                id: rows[i].id,
                name: rows[i].name,
                numQuestions: rows[i].numQuestions,
                date: rows[i].date,
                unlocked: rows[i].unlocked == 1 ? true : false,
                showScore: rows[i].showScore == 1 ? true : false,
              }
            );
            switch (rows[i].cluster) {
              case "mix":
              exams[i].cluster = "Mixed Clusters";
              break;
              case "marketing":
              exams[i].cluster = "Marketing";
              break;
              case "businessadmin":
              exams[i].cluster = "Business Administration";
              break;
              case "hospitality":
              exams[i].cluster = "Hospitality & Tourism";
              break;
              case "finance":
              exams[i].cluster = "Finance";
              break;
            }
          }
          res.json(exams);
        });
      }
      else {
        connection.query("SELECT id, name, numQuestions, cluster, DATE_FORMAT(dateCreated, '%M %D %Y') as date, unlocked, showScore FROM createdexams WHERE name LIKE ? AND cluster = ? LIMIT ? OFFSET ?;", [search, cluster, examsPer, offset], function(err, rows, fields) {
          connection.release();
          if (err) {
            res.json({
              err: err
            });
            return;
          }
          for (var i = 0; i < rows.length; i++) {
            exams.push(
              {
                id: rows[i].id,
                name: rows[i].name,
                numQuestions: rows[i].numQuestions,
                cluster: rows[i].cluster,
                date: rows[i].date,
                unlocked: rows[i].unlocked == 1 ? true : false,
                showScore: rows[i].showScore == 1 ? true : false,
              }
            );
          }
          res.json(exams);
        });
      }
      break;


      case "getAttendanceData":
      var studentNumber = req.session.studentNumber;
      //Check if session open
      connection.query("SELECT id, optionA, optionB, optionC, optionD, answer FROM attendancesessions WHERE endTime IS NULL", function(err, rows, fields) {
        if (err) {
          res.json({
            err: "Server error - try again later"
          });
          return;
        }
        if (rows.length == 0) {
          res.json({
            err: null,
            attendanceOpen: false
          });
          return;
        }
        var attendanceid = rows[0].id;
        var attendanceAnswer = rows[0].answer;
        var attendanceOptions = {
          optionA: rows[0].optionA,
          optionB: rows[0].optionB,
          optionC: rows[0].optionC,
          optionD: rows[0].optionD,
        };
        //Check if user has completed session
        connection.query("SELECT correct FROM attendancerecords WHERE attendanceSessionid = ? AND studentNumber = ?", [attendanceid, studentNumber], function(err, rows, fields) {
          if (err) {
            res.json({
              err: "Server error - try again later"
            });
            return;
          }
          if (rows.length > 0) {
            var completed = false;
            for (var i = 0; i < rows.length; i++) {
              if (rows[i].correct == 1) {
                completed = true;
              }
            }
            if (completed) {
              res.json({
                err: null,
                attendanceOpen: true,
                attendanceCompleted: true,
                triesLeft: 2 - rows.length,
                attendanceid: attendanceid,
                attendanceAnswer: attendanceAnswer,
                attendanceOptions: attendanceOptions
              });
              return;
            }
            else {
              res.json({
                err: null,
                attendanceOpen: true,
                attendanceCompleted: false,
                triesLeft: 2 - rows.length,
                attendanceid: attendanceid,
                attendanceOptions: attendanceOptions
              });
              return;
            }
          }
          else {
            res.json({
              err: null,
              attendanceOpen: true,
              attendanceCompleted: false,
              triesLeft: 2,
              attendanceid: attendanceid,
              attendanceOptions: attendanceOptions
            });
            return;
          }
        });
      });
      break;


      case "getAttendanceSession":
      connection.query("SELECT id, optionA, optionB, optionC, optionD, answer, DATE_FORMAT(startTime, '%d %M, %Y at %r') AS startTime, createdBy FROM attendancesessions WHERE endTime IS NULL", function(err, rows, fields) {
        if (err) {
          res.json({
            err: "Sever error - try again later"
          });
          return;
        }
        if (rows.length == 0) {
          res.json({
            err: null,
            currentSession: null
          });
          return;
        }
        res.json({
          err: null,
          currentSession: {
            id: rows[0].id,
            optionA: rows[0].optionA,
            optionB: rows[0].optionB,
            optionC: rows[0].optionC,
            optionD: rows[0].optionD,
            answer: rows[0].answer,
            startTime: rows[0].startTime,
            createdBy: rows[0].createdBy
          }
        });
        return;
      });
      break;


      case "getClusterProficiency":
      User.getClusterProficiency(req.session.studentNumber, function(err, clusterProficiency) {
        if (err) {
          res.json({
            err: err
          });
          return;
        }
        res.json({
          err: null,
          clusterProficiency: clusterProficiency
        });
        return;
      });
      break;

      case "getExamResultsLine":
      User.getExamResultsLine(req.session.studentNumber, function(err, examResults) {
        if (err) {
          res.json({
            err: err
          });
          return;
        }
        res.json({
          err: null,
          examResults: examResults
        });
        return;
      });
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
      var postsPer = parseInt(req.body.postsPer);
      var offset = parseInt(req.body.offset);
      connection.query("SELECT timeline.id, timeline.messageHTML, timeline.messageMarkdown, DATE_FORMAT(timeline.date, '%M %D %Y') as date, DATE_FORMAT(timeline.date, '%H:%i') as time, members.firstName as posterFirstName, members.lastName as posterLastName, timeline.poster as posterStudentNumber, timeline.class FROM timeline JOIN members ON members.studentNumber = timeline.poster ORDER BY UNIX_TIMESTAMP(timeline.date) DESC LIMIT ? OFFSET ?", [postsPer, offset], function(err, rows, fields) {
        if (err) {
          res.json(
            {
              err: "Can't load posts - try again later"
            }
          );
          return;
        }
        res.json(
          {
            err: null,
            posts: rows
          }
        );
        return;
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
      if (!req.session.examHash) {
        res.json({
          err: "Exam already submitted"
        });
        return;
      }
      var givenAnswers = JSON.parse(req.body.givenAnswers);
      connection.query("SELECT examid, modulus, increment, seed, multiplier, offset, cluster, total FROM examresults WHERE examHash = ?", [req.session.examHash], function(err, rows, fields) {
        if (err) {
          res.json({
            err: "Server error - try again later"
          });
          return;
        }
        //If some linConGen error
        if (rows[0].total != givenAnswers.length) {
          res.json({
            err: "Error with exam - try another exam"
          });
          return;
        }
        //If non random exam
        if (rows[0].examid != 0) {
          var examid = rows[0].examid;
          connection.query("SELECT id, showScore, includeStats FROM createdexams WHERE id = ?", [examid], function(err, rows, fields) {
            if (err) {
              res.json({
                err: "Server error - try again later"
              });
              return;
            }
            var showScore = rows[0].showScore == 1 ? true : false;
            var includeStats = rows[0].includeStats == 1 ? true : false;
            Exam.getidList(examid, function(err, ids) {
              connection.query("SELECT answer FROM questionanswers WHERE questionid IN (" + ids.join() + ") ORDER BY FIND_IN_SET(questionid, '" + ids.join() + "')", function(err, rows, fields) {
                if (err) {
                  res.json({
                    err: "Error getting exam answers - try again later"
                  });
                  return;
                }
                var answers = [];
                var correct = [];
                var numCorrect = 0;
                for (var i = 0; i < rows.length; i++) {
                  answers[i] = rows[i].answer;
                  if (givenAnswers[i] == answers[i]) {
                    correct[i] = 1;
                    numCorrect++;
                  }
                  else {
                    correct[i] = 0;
                  }
                }

                //Save individual questions
                var attemptedQuestionsQuery = "BEGIN;";
                var attemptedQuestionsQueryInsertArray = []
                for (var i = 0; i < answers.length; i++) {
                  attemptedQuestionsQuery += "INSERT INTO questionsattempted (studentNumber, questionid, correct, guess, examid) VALUES (?, ?, ?, ?, ?);";
                  attemptedQuestionsQueryInsertArray.push(req.session.studentNumber);
                  attemptedQuestionsQueryInsertArray.push(ids[i]);
                  attemptedQuestionsQueryInsertArray.push(correct[i]);
                  attemptedQuestionsQueryInsertArray.push(givenAnswers[i]);
                  attemptedQuestionsQueryInsertArray.push(examid);
                }
                attemptedQuestionsQuery += "COMMIT;";
                connection.query(attemptedQuestionsQuery, attemptedQuestionsQueryInsertArray, function(err, rows, fields) {
                  if (err) {
                    res.json({
                      err: "Error saving exam - try again later"
                    });
                    return;
                  }
                  Exam.saveExam(req.session.examHash, numCorrect, function(err) {
                    req.session.examHash = null;
                    if (!err) {
                      if (showScore) {
                        res.json({
                          answers: answers,
                          showScore: true
                        });
                      }
                      else {
                        res.json({
                          showScore: false
                        })
                      }
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
          });
        }
        else {
          var numQuestions = rows[0].total;
          Utilities.linConGen(rows[0].modulus, rows[0].increment, rows[0].seed, rows[0].multiplier, numQuestions, rows[0].offset, function(numList) {
            //Can only use numList to determine indices from 0 - size of number set, thus for specific clusters (where question ids may range from 1400 - 2400 & numList
            //would show 1 - 1000) the range of question ids must be loaded and put into array to load exam
            if (rows[0].cluster == "mix") {
              idQuery = "SELECT questionid FROM questionclusters ORDER BY questionid";
            }
            else {
              idQuery = "SELECT questionid FROM questionclusters WHERE cluster = '" + rows[0].cluster + "' ORDER BY questionid";
            }
            connection.query(idQuery, function(err, rows, fields) {
              if (err) {
                res.json({
                  err: "Error getting exam answers - try again later"
                });
                return;
              }
              questionList = [];
              for (var i = 0; i < numQuestions; i++) {
                questionList.push(rows[numList[i]].questionid);
              }
              connection.query("SELECT answer FROM questionanswers WHERE questionid IN (" + questionList.join() + ") ORDER BY FIND_IN_SET(questionid, '" + questionList.join() + "')", function(err, rows, fields) {
                if (err) {
                  res.json({
                    err: "Error getting exam answers - try again later"
                  });
                  return;
                }
                var answers = [];
                var correct = [];
                var numCorrect = 0;
                for (var i = 0; i < rows.length; i++) {
                  answers[i] = rows[i].answer;
                  if (givenAnswers[i] == answers[i]) {
                    correct[i] = 1;
                    numCorrect++;
                  }
                  else {
                    correct[i] = 0;
                  }
                }
                //Save individual questions
                var attemptedQuestionsQuery = "BEGIN;";
                var attemptedQuestionsQueryInsertArray = []
                for (var i = 0; i < answers.length; i++) {
                  attemptedQuestionsQuery += "INSERT INTO questionsattempted (studentNumber, questionid, correct, guess, examid) VALUES (?, ?, ?, ?, ?);";
                  attemptedQuestionsQueryInsertArray.push(req.session.studentNumber);
                  attemptedQuestionsQueryInsertArray.push(questionList[i]);
                  attemptedQuestionsQueryInsertArray.push(correct[i]);
                  attemptedQuestionsQueryInsertArray.push(givenAnswers[i]);
                  attemptedQuestionsQueryInsertArray.push(0);
                }
                attemptedQuestionsQuery += "COMMIT;";
                connection.query(attemptedQuestionsQuery, attemptedQuestionsQueryInsertArray, function(err, rows, fields) {
                  if (err) {
                    res.json({
                      err: "Error saving exam - try again later"
                    });
                    return;
                  }
                  Exam.saveExam(req.session.examHash, numCorrect, function(err) {
                    req.session.examHash = null;
                    if (!err) {
                      res.json({
                        answers: answers,
                        showScore: true
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
          });
        }
      });
      break;

      case "createExam":
      //For now, include stats will defualt to the same value as show score when the exam is created
      var examName = req.body.examName;
      var examCluster = req.body.examCluster;
      var examShowScore = JSON.parse(req.body.examShowScore) ? 1 : 0;
      var examUnlocked = JSON.parse(req.body.examUnlocked) ? 1 : 0;
      var examShowTimer = JSON.parse(req.body.examShowTimer) ? 1 : 0;
      var examQuestions = JSON.parse(req.body.examQuestions);
      connection.query("SELECT name FROM createdexams WHERE name = ?", [examName], function(err, rows, fields) {
        if (rows.length != 0) {
          res.json({
            err: "Exam with same name already exists"
          });
          return;
        }
        connection.query("INSERT INTO createdexams (name, numQuestions, cluster, unlocked, showScore, includeStats, showTimer) VALUES (?, ?, ?, ?, ?, ?, ?);", [examName, examQuestions.length, examCluster, examUnlocked, examShowScore, examShowScore, examShowTimer], function(err, rows, fields) {
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

      case "switchExamLock":
      var examid = parseInt(req.body.examid, 10);
      connection.query("UPDATE createdexams SET unlocked = IF(unlocked=1, 0, 1) WHERE id = ?;", [examid], function(err, rows, fields) {
        if (err) {
          res.json({
            err: "Server error - try again later"
          });
          return;
        }
        if (rows.affectedRows != 1) {
          res.json({
            err: "Server error - try again later"
          });
          return;
        }
        res.json({
          err: null
        });
        return;
      });
      break;

      case "submitNewQuestion":
      var questionData = JSON.parse(req.body.questionData);
      connection.query("BEGIN;" +
      "INSERT INTO questions (question) VALUES (?);" +
      "INSERT INTO questionoptions (questionid, optionA, optionB, optionC, optionD) VALUES (LAST_INSERT_ID(), ?, ?, ?, ?);" +
      "INSERT INTO questionanswers (questionid, answer) VALUES (LAST_INSERT_ID(), ?);" +
      "INSERT INTO questionclusters (questionid, cluster) VALUES (LAST_INSERT_ID(), ?);" +
      "COMMIT;",
      [questionData.question, questionData.optionA, questionData.optionB, questionData.optionC, questionData.optionD, questionData.answer, questionData.cluster], function(err, rows, fields) {
        connection.release();
        if (err) {
          res.json({
            err: "Server error - try again later"
          });
          return;
        }
        res.json({
          err: null
        });
        return;
      });
      break;


      case "checkAttendanceAnswer":
      var givenAnswer = req.body.answer;
      connection.query("SELECT id, answer FROM attendancesessions WHERE endTime IS NULL", function(err, rows, fields) {
        if (err) {
          res.json({
            err: "Server error - try again later"
          });
          return;
        }
        if (rows.length == 0) {
          res.json({
            err: "No attendance session is open"
          });
          return;
        }
        var id = rows[0].id;
        var answer = rows[0].answer;
        connection.query("SELECT studentNumber FROM attendancerecords WHERE studentNumber = ? AND attendanceSessionid = ?", [req.session.studentNumber, id], function(err, rows, fields) {
          if (err) {
            res.json({
              err: "Server error - try again later"
            });
            return;
          }
          if (rows >= 2) {
            if (err) {
              res.json({
                err: "You cannot attempt this session again"
              });
              return;
            }
          }
          connection.query("INSERT INTO attendancerecords (studentNumber, attendanceSessionid, answer, time, correct) VALUES (?, ?, ?, NOW(), ?);", [req.session.studentNumber, id, givenAnswer, givenAnswer == answer ? 1 : 0], function(err, rows, fields) {
            if (err) {
              res.json({
                err: "Server error - try again later"
              });
              return;
            }
            res.json({
              err: null,
              correct: givenAnswer == answer
            });
            return;
          });
        });
      });
      break;

      case "startAttendanceSession":
      var sessionData = JSON.parse(req.body.sessionData);
      connection.query("SELECT id FROM attendancesessions WHERE endTime IS NULL", function (err, rows, fields) {
        if (rows.length > 0) {
          res.json({
            err: "Session already in progress"
          });
          return;
        }
        connection.query("INSERT INTO attendancesessions (optionA, optionB, optionC, optionD, answer, createdBy) VALUES (?, ?, ?, ?, ?, ?);", [sessionData.optionA, sessionData.optionB, sessionData.optionC, sessionData.optionD, sessionData.answer, req.session.studentNumber], function(err, rows, fields) {
          if (err) {
            res.json({
              err: "Server error - try again later"
            });
            return;
          }
          res.json({
            err: null
          });
          return;
        });
      });
      break;

      case "endAttendanceSession":
      connection.query("UPDATE attendancesessions SET endTime = NOW() WHERE endTime IS NULL", function (err, rows, fields) {
        if (err) {
          res.json({
            err: "Server error - try again later"
          });
          return;
        }
        res.json({
          err: null
        });
        return;
      });
      break;

      case "updateColorPreference":
      var colors = {
        sidebarBackground: req.body.sidebarBackground,
        sidebarText: req.body.sidebarText,
        sidebarActive: req.body.sidebarActive
      }
      User.updateColorPreference(req.session.studentNumber, colors, function(err) {
        if (err) {
          res.send({
            err: err
          });
          return;
        }
        res.json({
          err: null
        });
        return;
      });
      break;

      case "changePassword":
      var password = req.body.password;
      User.setPassword({password: password, studentNumber: req.session.studentNumber}, function(err) {
        if (err) {
          res.json({
            err: err
          });
          return;
        }
        res.json({
          err: null
        });
        return;
      });
      break;

      case "changeEmail":
      var email = req.body.email;
      User.setEmail({email: email, studentNumber: req.session.studentNumber}, function(err) {
        if (err) {
          res.json({
            err: err
          });
          return;
        }
        //So email updates to user
        req.session.email = email;
        res.locals.email = email;
        res.json({
          err: null
        });
        return;
      });
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

module.exports = router;
