var express = require('express');
var db = require("../db");

var Utilities = require("./utilities");

var examAnswers = function() {

}

exam.loadRandomExam = function(cluster, numQuestions, callback) {
  //get number of questions in database
  var numQuestionsQuery;
  if (cluster == "mix") {
    numQuestionsQuery = "SELECT COUNT(*) as numQuestions FROM questions;";
  }
  else {
    numQuestionsQuery = "SELECT COUNT(*) as numQuestions FROM questionclusters WHERE cluster = '" + cluster + "';";
  }
  db.pool.query(numQuestionsQuery, function(err, rows, fields) {
    if (err) {
      callback("Server error- try again later");
      return;
    }
    var totalQuestions = rows[0].numQuestions;
    //Generate an LCG to determine question order
    Utilities.linCongGenGen(totalQuestions, function(mod, increment, seed, multiplier) {
      var offset = parseInt(Math.random() * (totalQuestions));
      Utilities.linConGen(mod, increment, seed, multiplier, numQuestions, offset, function(numList) {
        if (hasDup(numList)) {
          console.log("Duplicates exam generated with mod: " + mod + ", increment: " + increment + ", multiplier: " + multiplier);
        }
        //Can only use numList to determine indices from 0 - size of number set, thus for specific clusters (where question ids may range from 1400 - 2400 & numList
        //would show 1 - 1000) the range of question ids must be loaded and put into array to load exam
        if (cluster == "mix") {
          idQuery = "SELECT questionid FROM questionclusters ORDER BY questionid";
        }
        else {
          idQuery = "SELECT questionid FROM questionclusters WHERE cluster = '" + cluster + "' ORDER BY questionid";
        }
        db.pool.query(idQuery, function(err, rows, fields) {
          if (err) {
            callback("Server error- try again later");
            return;
          }
          questionList = [];
          for (var i = 0; i < numQuestions; i++) {
            questionList.push(rows[numList[i]].questionid);
          }
          //Get exam data from database given generated questionids
          var examQuery;
          if (cluster == "mix") {
            examQuery = "SELECT questions.questionid, question, optionA, optionB, optionC, optionD FROM questions LEFT JOIN questionoptions ON questionoptions.questionid = questions.questionid LEFT JOIN questionclusters ON questionclusters.questionid = questions.questionid WHERE questions.questionid IN (" + questionList.join() + ") ORDER BY FIND_IN_SET(questions.questionid, '" + questionList.join() + "')";
          }
          else {
            examQuery = "SELECT questions.questionid, question, optionA, optionB, optionC, optionD FROM questions LEFT JOIN questionoptions ON questionoptions.questionid = questions.questionid LEFT JOIN questionclusters ON questionclusters.questionid = questions.questionid WHERE cluster = '" + cluster + "' AND questions.questionid IN (" + questionList.join() + ") ORDER BY FIND_IN_SET(questions.questionid, '" + questionList.join() + "')";
          }
          db.pool.query(examQuery, function(err, rows, fields) {
            if(err) {
              callback("Server error- try again later");
              return;
            }
            var exam = [];
            for (var i = 0; i < rows.length; i++) {
              exam[i] = {

              };
              exam[i].questionid = rows[i].questionid;
              exam[i].question = rows[i].question;
              exam[i].optionA = rows[i].optionA;
              exam[i].optionB = rows[i].optionB;
              exam[i].optionC = rows[i].optionC;
              exam[i].optionD = rows[i].optionD;
            }
            callback(null, mod, increment, seed, multiplier, offset, exam);
            return;
          });
        });
      });
    });
  });
}

exam.checkExamUnlocked = function(examid, callback) {
  db.pool.query("SELECT unlocked FROM createdexams WHERE id = ?", [examid], function(err, rows, fields) {
    if (err) {
      callback("Server error - try again later");
      return;
    }
    if (rows[0].length == 0) {
      callback(null, false);
      return;
    }
    else if (rows[0].unlocked == 0) {
      callback(null, false);
      return;
    }
    callback(null, true);
  });
}

exam.loadExam = function(examid, callback) {
  exam.getidList(examid, function(err, ids) {
    if (err) {
      callback("Server error - try again later");
      return;
    }
    if (exam.length != numQuestions) {
      exam.length = numQuestions;
    }
    db.pool.query("SELECT questions.questionid, question, optionA, optionB, optionC, optionD FROM questions LEFT JOIN questionoptions ON questionoptions.questionid = questions.questionid WHERE questions.questionid IN (" + ids.join() + ") ORDER BY FIND_IN_SET(questions.questionid, '" + ids.join() + "');", function(err, rows, fields) {
      if (err) {
        callback("Server error - try again later");
        return;
      }
      var exam = [];
      for (var i = 0; i < rows.length; i++) {
        exam[i] = {};
        exam[i].questionid = rows[i].questionid;
        exam[i].question = rows[i].question;
        exam[i].optionA = rows[i].optionA;
        exam[i].optionB = rows[i].optionB;
        exam[i].optionC = rows[i].optionC;
        exam[i].optionD = rows[i].optionD;
      }
      callback(null, exam);
      return;
    });
  });
}

exam.saveExam = function(examHash, score, callback) {
  db.pool.query("UPDATE examresults SET correct = ?, endTime = now() WHERE examHash = ?", [score, examHash], function(err, rows, fields) {
    if (rows.affectedRows == 1) {
      callback(null);
      return;
    }
    else {
      callback("Server error - try again later");
      return;
    }
  });
}


//Unfinished
exam.resumeExam = function(examHash, callback) {
  db.pool.query("SELECT modulus, increment, seed, multiplier, offset, total, cluster FROM examresults WHERE examHash = ?", [examHash], function(err, rows, fields) {
    if(err) {
      callback("Server error- try again later");
      return;
    }
    var mod = rows[0].modulus;
    var increment = rows[0].increment;
    var seed = rows[0].seed;
    var multiplier = rows[0].multiplier;
    var offset = rows[0].offset;
    var numQuestions = rows[0].total;
    var cluster = rows[0].cluster;

    Utilities.linConGen(mod, increment, seed, multiplier, numQuestions, offset, function(questionList) {
      //Get exam data from database given generated questionids
      var examQuery;
      if (cluster == "mix") {
        examQuery = "SELECT questions.questionid, question, optionA, optionB, optionC, optionD FROM questions LEFT JOIN questionoptions ON questionoptions.questionid = questions.questionid LEFT JOIN questionclusters ON questionclusters.questionid = questions.questionid WHERE questions.questionid IN (" + questionList.join() + ") ORDER BY FIND_IN_SET(questions.questionid, '" + questionList.join() + "')";
      }
      else {
        examQuery = "SELECT questions.questionid, question, optionA, optionB, optionC, optionD FROM questions LEFT JOIN questionoptions ON questionoptions.questionid = questions.questionid LEFT JOIN questionclusters ON questionclusters.questionid = questions.questionid WHERE cluster = '" + cluster + "' AND questions.questionid IN (" + questionList.join() + ") ORDER BY FIND_IN_SET(questions.questionid, '" + questionList.join() + "')";
      }
      db.pool.query(examQuery, function(err, rows, fields) {
        if(err) {
          callback("Server error- try again later");
          return;
        }
        var exam = [];
        for (var i = 0; i < rows.length; i++) {
          exam[i] = {

          };
          exam[i].questionid = rows[i].questionid;
          exam[i].question = rows[i].question;
          exam[i].optionA = rows[i].optionA;
          exam[i].optionB = rows[i].optionB;
          exam[i].optionC = rows[i].optionC;
          exam[i].optionD = rows[i].optionD;
        }
        callback(exam);
        return;
      });
    });
  });
}

exam.startExam = function(studentNumber, examData, callback) {
  //Check if examData is object (random exam) or examid (precreated exam)
  if (Number.isInteger(examData)) {
    db.pool.query("SELECT numQuestions, cluster FROM createdexams WHERE id = ?", [examData], function(err, rows, fields) {
      if(err) {
        callback("Server error- try again later");
        return;
      }
      Utilities.generateRandomString(32, function(examHash) {
        db.pool.query("INSERT INTO examresults (examid, total, studentNumber, examHash, cluster) VALUES (?, ?, ?, ?, ?);", [examData, rows[0].numQuestions, studentNumber, examHash, rows[0].cluster], function(err, rows, fields) {
          if(err) {
            callback("Server error- try again later");
            return;
          }
          callback(null, examHash);
          return;
        });
      });
    });
  }
  else {
    Utilities.generateRandomString(32, function(examHash) {
      db.pool.query("INSERT INTO examresults (modulus, increment, seed, multiplier, offset, total, studentNumber, examHash, cluster) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);", [examData.mod, examData.increment, examData.seed,examData. multiplier, examData.offset, examData.numQuestions, studentNumber, examHash, examData.cluster], function(err, rows, fields) {
        if(err) {
          callback("Server error- try again later");
          return;
        }
        callback(null, examHash);
        return;
      });
    });
  }
}

exam.getidList = function(examid, callback) {
  db.pool.query("SELECT questionid FROM createdexamquestions WHERE examid = ?", [examid], function(err, rows, fields) {
    if (err) {
      callback("Server error - try again later");
      return;
    }
    var ids = [];

    for (var i = 0; i < rows.length; i++) {
      ids.push(rows[i].questionid);
    }
    callback(null, ids);
  });
}

exam.checkShowTimer = function(examid, callback) {
  db.pool.query("SELECT showTimer FROM createdexams WHERE id = ?", [examid], function(err, rows, fields) {
    if (err) {
      callback("Server error - try again later");
      return;
    }
    callback(null, rows[0].showTimer == 1);
  });
}

exam.getQuestion = function(questionid, callback) {
  db.pool.query('SELECT question, optionA, optionB, optionC, optionD, answer FROM questionsattempted JOIN questions ON questionsattempted.questionid = questions.questionid JOIN questionanswers ON questionsattempted.questionid = questionanswers.questionid JOIN questionoptions ON questionsattempted.questionid = questionoptions.questionid WHERE questions.questionid = ?;', [questionid], function(err, rows, fields) {
    if (err) {
      callback("Server error - try again later");
      return;
    }
    var question = {
      question: rows[0].question,
      optionA: rows[0].optionA,
      optionB: rows[0].optionB,
      optionC: rows[0].optionC,
      optionD: rows[0].optionD,
      answer: rows[0].answer,
    }
    callback(null, question);
  });
}


module.exports = exam;


function hasDup(array) {
    return array.some(function(value) {                            // .some will break as soon as duplicate found (no need to itterate over all array)
       return array.indexOf(value) !== array.lastIndexOf(value);   // comparing first and last indexes of the same value
    })
}
