var express = require('express');
var db = require("../db");

var statistics = function() {

}

statistics.getMostIncorrectlyAnswered = function(callback) {
  var statQuery = 'SELECT question, optionA, optionB, optionC, optionD, answer FROM questionsattempted JOIN questions ON questionsattempted.questionid = questions.questionid JOIN questionanswers ON questionsattempted.questionid = questionanswers.questionid JOIN questionoptions ON questionsattempted.questionid = questionoptions.questionid GROUP BY questionsattempted.questionid ORDER BY SUM(IF(questionsattempted.correct = 0, 1, 0)) DESC LIMIT 1'
  db.pool.getConnection(function(err, connection) {
    connection.query(statQuery, function(err, rows, fields) {
      connection.release();
      if (err) {
        callback(err);
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
      callback(null, rows[0].total);
    });
  });
}

statistics.getChapterExamResults = function(callback) {
  db.pool.getConnection(function(err, connection) {
    if (err) {
      callback(err);
      return;
    }
    var a = connection.query("SELECT members.studentNumber as studentNumber, firstName, lastName, correct, total, DATE_FORMAT(startTime, '%d %M, %Y') as date, name, examresults.cluster as cluster FROM examresults LEFT JOIN createdexams ON createdexams.id = examresults.examid JOIN members on members.studentNumber = examresults.studentNumber AND correct IS NOT NULL AND (includeStats = 1 OR examresults.examid = 0) ORDER BY startTime DESC;", function(err, rows, fields) {
      connection.release();
      console.log(a.sql);
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
