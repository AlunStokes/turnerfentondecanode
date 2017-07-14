var express = require('express');
var db = require("../db");

var statistics = function() {

}


statistics.loadClusterProficiencyPieChart = function(studentNumber, callback) {
  var statQuery = "SELECT SUM(correct = 1 && cluster = 'marketing') AS marketingCorrect, SUM(cluster = 'marketing') AS marketingAttempted, SUM( correct = 1 && cluster = 'businessadmin' ) AS businessadminCorrect, SUM(cluster = 'businessadmin') AS businessadminAttempted, SUM( correct = 1 && cluster = 'finance' ) AS financeCorrect, SUM(cluster = 'finance') AS financeAttempted, SUM( correct = 1 && cluster = 'hospitality' ) AS hospitalityCorrect, SUM(cluster = 'hospitality') AS hospitalityAttempted FROM questionsattempted JOIN questionclusters ON questionclusters.questionid = questionsattempted.questionid WHERE studentNumber = ?";
  db.pool.getConnection(function(err, connection) {
    connection.query(statQuery, [studentNumber], function(err, rows, fields) {
      connection.release();
      if (err) {
        callback(err);
        return;
      }

      var stats = {
        marketingPercentage: (rows[0].marketingCorrect/rows[0].marketingAttempted)*100/((rows[0].marketingCorrect/rows[0].marketingAttempted)+(rows[0].financeCorrect/rows[0].financeAttempted)+(rows[0].hospitalityCorrect/rows[0].hospitalityAttempted)+(rows[0].businessadminCorrect/rows[0].businessadminAttempted)),
        financePercentage: (rows[0].financeCorrect/rows[0].financeAttempted)*100/((rows[0].marketingCorrect/rows[0].marketingAttempted)+(rows[0].financeCorrect/rows[0].financeAttempted)+(rows[0].hospitalityCorrect/rows[0].hospitalityAttempted)+(rows[0].businessadminCorrect/rows[0].businessadminAttempted)),
        hospitalityPercentage: (rows[0].hospitalityCorrect/rows[0].hospitalityAttempted)*100/((rows[0].marketingCorrect/rows[0].marketingAttempted)+(rows[0].financeCorrect/rows[0].financeAttempted)+(rows[0].hospitalityCorrect/rows[0].hospitalityAttempted)+(rows[0].businessadminCorrect/rows[0].businessadminAttempted))
      }
      stats.businessadminPercentage = 100 - (stats.marketingPercentage + stats.financePercentage + stats.hospitalityPercentage);

      stats.marketingPercentage = stats.marketingPercentage.toFixed(2);
      stats.financePercentage = stats.financePercentage.toFixed(2);
      stats.hospitalityPercentage = stats.hospitalityPercentage.toFixed(2);
      stats.businessadminPercentage = stats.businessadminPercentage.toFixed(2);

      callback(null, stats);
    });
  });
}

statistics.getMostIncorrectlyAnswered = function(studentNumber, callback) {
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
  var statQuery = "SELECT COUNT(*) as numRows FROM questionsattempted";
  db.pool.getConnection(function(err, connection) {
    connection.query(statQuery, function(err, rows, fields) {
      connection.release();
      if (err) {
        callback(err);
        return;
      }
      callback(null, rows[0].numRows);
    });
  });
}

module.exports = statistics;
