var express = require('express');
var db = require("../db");

var statistics = function() {

}

statistics.getMostIncorrectlyAnswered = function(callback) {
  //Determines the top n questions that will be chosen from
  var numQuestions = 10;
  var statQuery = 'SELECT questions.questionid as questionid FROM questionsattempted JOIN questions ON questionsattempted.questionid = questions.questionid JOIN questionanswers ON questionsattempted.questionid = questionanswers.questionid JOIN questionoptions ON questionsattempted.questionid = questionoptions.questionid GROUP BY questionsattempted.questionid ORDER BY SUM(IF(questionsattempted.correct = 0, 1, 0)) DESC LIMIT ?'
  db.pool.getConnection(function(err, connection) {
    connection.query(statQuery, [numQuestions], function(err, rows, fields) {
      connection.release();
      if (err) {
        callback(err);
        return;
      }
      if (rows.length < numQuestions) {
        numQuestions = rows.length;
      }
      if (rows.length == 0) {
        callback("No question data existant");
        return;
      }
      var rowNum = Math.floor(Math.random() * numQuestions);
      var questionid = rows[rowNum].questionid;
      callback(null, questionid);
      return;
    });
  });
}


statistics.getNumQuestionsAnswered = function(callback) {
  var statQuery = "SELECT SUM(total) total FROM examresults WHERE endTime IS NOT NULL";
  db.pool.getConnection(function(err, connection) {
    connection.query(statQuery, function(err, rows, fields) {
      connection.release();
      if (err) {
        callback(err);
        return;
      }
      //Non 0 case
      if (rows[0].total) {
        callback(null, rows[0].total);
        return;
      }
      //0 case
        callback(null, 0);
    });
  });
}

statistics.getChapterExamResults = function(examid, callback) {
  db.pool.getConnection(function(err, connection) {
    if (err) {
      callback(err);
      return;
    }
    var query;
    if (examid == -1) {
      query = "SELECT members.studentNumber as studentNumber, firstName, lastName, correct, total, alum, grade, DATE_FORMAT(startTime, '%Y/%c/%e %k:%i:%s') as date, name, examresults.cluster as cluster FROM examresults LEFT JOIN createdexams ON createdexams.id = examresults.examid JOIN members on members.studentNumber = examresults.studentNumber AND correct IS NOT NULL ORDER BY startTime DESC;";
    }
    else {
      query = "SELECT members.studentNumber as studentNumber, firstName, lastName, correct, total, alum, grade, DATE_FORMAT(startTime, '%Y/%c/%e %k:%i:%s') as date, name, examresults.cluster as cluster FROM examresults LEFT JOIN createdexams ON createdexams.id = examresults.examid JOIN members on members.studentNumber = examresults.studentNumber AND correct IS NOT NULL WHERE examid=" + examid + " ORDER BY startTime DESC;";
    }
    connection.query(query, function(err, rows, fields) {
      connection.release();
      if (err) {
        callback(err);
        return;
      }
      var examResults = [];
      for (var i = 0; i < rows.length; i++) {
        examResults.push(
          {
            studentNumber: rows[i].studentNumber,
            firstName: rows[i].firstName,
            lastName: rows[i].lastName,
            correct: rows[i].correct,
            total: rows[i].total,
            alum: rows[i].alum == 1 ? "X" : "",
            grade: rows[i].grade,
            percentage: ((rows[i].correct/rows[i].total) * 100).toFixed(2),
            name: rows[i].name ? rows[i].name : "Random",
            cluster: valueToCluster(rows[i].cluster),
            date: rows[i].date
          }
        );
      }
      callback(null, examResults);
      return;
    });
  });
}

statistics.getExamids = function(callback) {
  db.pool.getConnection(function(err, connection) {
    if (err) {
      callback(err);
      return;
    }
    connection.query("SELECT id, name FROM createdexams ORDER BY id DESC;", function(err, rows, fields) {
      connection.release();
      if (err) {
        callback(err);
        return;
      }
      var examids = [];
      examids.push(
        {
          id: -1,
          name: "All Exams"
        },
        {
          id: 0,
          name: "Random"
        }
      );
      for (var i = 0; i < rows.length; i++) {
        examids.push(
          {
            id: rows[i].id,
            name: rows[i].name
          }
        );
      }
      callback(null, examids);
      return;
    });
  });
}

module.exports = statistics;


function valueToCluster (value) {
  switch(value) {
    case "mix":
    return "Mixed Clusters";
    break;
    case "marketing":
    return "Marketing";
    break;
    case "finance":
    return "Finance";
    break;
    case "businessadmin":
    return "Business Administration";
    break;
    case "hospitality":
    return "Hospitality & Tourism";
    break;
    case "writtens":
    return "Writtens";
    break;
    default:
    return "undefined"
  }
}
