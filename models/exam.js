var express = require('express');
var db = require("../db");

var Utilities = require("./utilities");

var exam = function() {

}

exam.loadRandomExam = function(cluster, numQuestions, callback) {
  db.pool.getConnection(function(err, connection) {
    if(err) {
      callback("Server error- try again later");
      return;
    }
    //get number of questions in database
    var numQuestionsQuery;
    if (cluster == "mix") {
      numQuestionsQuery = "SELECT COUNT(*) as numQuestions FROM questions;";
    }
    else {
      numQuestionsQuery = "SELECT COUNT(*) as numQuestions FROM questionclusters WHERE cluster = '" + cluster + "';";
    }
    connection.query(numQuestionsQuery, function(err, rows, fields) {
      if (err) {
        callback("Server error- try again later");
        return;
      }
      var totalQuestions = rows[0].numQuestions;

      //Generate an LCG to determine question order
      Utilities.linCongGenGen(totalQuestions, function(mod, increment, seed, multiplier) {
        var offset = parseInt(Math.random() * (totalQuestions));
        Utilities.linConGen(mod, increment, seed, multiplier, numQuestions, offset, function(numList) {

          //Can only use numList to determine indices from 0 - size of number set, thus for specific clusters (where question ids may range from 1400 - 2400 & numList
          //would show 1 - 1000) the range of question ids must be loaded and put into array to load exam
          if (cluster == "mix") {
            idQuery = "SELECT questionid FROM questionclusters ORDER BY questionid";
          }
          else {
            idQuery = "SELECT questionid FROM questionclusters WHERE cluster = '" + cluster + "' ORDER BY questionid";
          }
          connection.query(idQuery, function(err, rows, fields) {
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
            connection.query(examQuery, function(err, rows, fields) {
              connection.release();
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
  });
}

exam.saveExam = function(examHash, score, callback) {
  db.pool.getConnection(function(err, connection) {
    if(err) {
      callback("Server error- try again later");
      return;
    }
    connection.query("UPDATE examresults SET correct = ?, endTime = now() WHERE examHash = ?", [score, examHash], function(err, rows, fields) {
      if (rows.affectedRows == 1) {
        callback(null);
        return;
      }
      else {
        callback("Server error - try again later");
        return;
      }
    });
  });
}


//Unfinished
exam.resumeExam = function(examHash, callback) {
  db.pool.getConnection(function(err, connection) {
    if(err) {
      callback("Server error- try again later");
      return;
    }
    connection.query("SELECT modulus, increment, seed, multiplier, offset, total, cluster FROM examresults WHERE examHash = ?", [examHash], function(err, rows, fields) {
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
        connection.query(examQuery, function(err, rows, fields) {
          connection.release();
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
  });
}

exam.startExam = function(studentNumber, mod, increment, seed, multiplier, offset, numQuestions, cluster, callback) {
  db.pool.getConnection(function(err, connection) {
    if(err) {
      callback("Server error- try again later");
      return;
    }
    Utilities.generateRandomString(32, function(examHash) {
      connection.query("INSERT INTO examResults (modulus, increment, seed, multiplier, offset, total, studentNumber, examHash, cluster) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);", [mod, increment, seed, multiplier, offset, numQuestions, studentNumber, examHash, cluster], function(err, rows, fields) {
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


module.exports = exam;
