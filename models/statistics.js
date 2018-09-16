var express = require('express');
var db = require("../db");

var statistics = function() {

}

statistics.getMostIncorrectlyAnswered = function(callback) {
  //Determines the top n questions that will be chosen from
  var numQuestions = 10;
  var statQuery = 'SELECT questions.questionid as questionid FROM questionsattempted JOIN questions ON questionsattempted.questionid = questions.questionid JOIN questionanswers ON questionsattempted.questionid = questionanswers.questionid JOIN questionoptions ON questionsattempted.questionid = questionoptions.questionid GROUP BY questionsattempted.questionid ORDER BY SUM(IF(questionsattempted.correct = 0, 1, 0)) DESC LIMIT ?'
  db.pool.query(statQuery, [numQuestions], function(err, rows, fields) {
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
}


statistics.getNumQuestionsAnswered = function(callback) {
  var statQuery = "SELECT SUM(total) total FROM examresults WHERE endTime IS NOT NULL";
  db.pool.query(statQuery, function(err, rows, fields) {
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
}

statistics.getChapterExamResults = function(examid, fields, callback) {
  //Remove non-existant fields
  for (var i = 0; i < fields.length; i++) {
    if (!keyToValue(fields[i])) {
      fields.splice(i, 1);
    }
  }
  var query = "SELECT ";
  for (var i = 0; i < fields.length; i++) {
    if (fields[i] == "cluster") {
      query += "examresults.cluster, ";
      continue;
    }
    if (fields[i] == "studentNumber") {
      query += "members.studentNumber, ";
      continue;
    }
    if (fields[i] == "percentage") {
      if (!("correct" in fields)) {
        query += "correct, ";
      }
      if (!("total" in fields)) {
        query += "total, ";
      }
      continue;
    }
    query += fields[i] + ", ";
  }

  //remove extra comma at end
  query = query.slice(0, query.length - 2) + " ";

  query += "FROM examresults LEFT JOIN createdexams ON createdexams.id = examresults.examid JOIN members on members.studentNumber = examresults.studentNumber AND correct IS NOT NULL ";
  if (examid != -1) {
    query += "WHERE examid=" + examid + " ";
  }
  query += "ORDER BY startTime DESC;";
  db.pool.query(query, function(err, rows, queryFields) {
    if (err) {
      callback(err);
      return;
    }
    var examResults = [];
    for (var i = 0; i < rows.length; i++) {
      examResults.push({});
      for (var j = 0; j < fields.length; j++) {
        if (fields[j] == "decaCluster") {
          examResults[i][fields[j]] = rows[i][fields[j]] != null ? valueToCluster(rows[i][fields[j]]) : "Not Chosen";
          continue;
        }
        if (fields[j] == "decaEvent") {
          examResults[i][fields[j]] = rows[i][fields[j]] != null ? rows[i][fields[j]].toUpperCase() : "Not Chosen";
          continue;
        }
        if (fields[j] == "cluster") {
          examResults[i][fields[j]] = rows[i][fields[j]] != null ? valueToCluster(rows[i][fields[j]]) : "Not Chosen";
          continue;
        }
        if (fields[j] == "name") {
          examResults[i][fields[j]] = rows[i][fields[j]] != null ? rows[i][fields[j]] : "Random";
          continue;
        }
        if (fields[j] == "percentage") {
          examResults[i][fields[j]] = ((rows[i]["correct"]/rows[i]["total"]) * 100).toFixed(2) + "%";
          continue;
        }
        if (fields[j] == "admin" || fields[j] == "alum") {
          examResults[i][fields[j]] = rows[i][fields[j]] == 1 ? "X" : "";
          continue;
        }
        if (fields[j] == "programName") {
          var name;
          switch(rows[i]["programName"]) {
            case "ib":
            name = "IB";
            break;
            case "academic":
            name = "Academic";
            break;
            case "vocational":
            name = "Vocational";
            break;
            case "french immersion":
            name = "French Immersion";
            break;
            case "master":
            name = "Master";
            break;
            default:
            name = "Unknown";
          }
          examResults[i][fields[j]] = name;
          continue;
        }
        examResults[i][fields[j]] = rows[i][fields[j]] != null ? rows[i][fields[j]] : "";
      }
    }
    db.pool.query("SELECT * FROM examresults LEFT JOIN createdexams ON createdexams.id = examresults.examid JOIN members on members.studentNumber = examresults.studentNumber LIMIT 1", function(err, rows, queryFields) {
      if (err) {
        callback(err);
        return;
      }

      var resultFields = [];

      for (var i = 0; i < fields.length; i++) {
        resultFields.push({key: fields[i], name: keyToValue(fields[i]), inTable: true});
      }

      for (var i = resultFields.length - 1; i < queryFields.length; i++) {
        if (!Number.isInteger(valInObjInArr(resultFields, "key", queryFields[i].name))) {
          var inTable;
          if (queryFields[i].key in examResults[0]) {
            inTable = true;
          }
          else {
            rinTable = false;
          }
          resultFields.push({key: queryFields[i].name, name: keyToValue(queryFields[i].name), inTable: inTable});
        }
      }

      resultFields = removeDuplicates(resultFields, "key");

      //Remove certain fields
      for (var i = 0; i < resultFields.length; i++) {
        if (resultFields[i].key == "id") {
          resultFields.splice(i, 1);
        }
      }

      if (!Number.isInteger(valInObjInArr(resultFields, "key", "percentage"))) {
        resultFields.push({key: "percentage", name: keyToValue("percentage"), inTable: false})
      }

      callback(null, examResults, resultFields);
      return;
    });
  });
}

statistics.getExamids = function(callback) {
  db.pool.query("SELECT id, name FROM createdexams ORDER BY id DESC;", function(err, rows, fields) {
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

function keyToValue(key) {
  switch(key) {
    case "id":
    return "ID";
    break;
    case "firstName":
    return "First Name";
    break;
    case "lastName":
    return "Last Name";
    break;
    case "email":
    return "Email";
    break;
    case "studentNumber":
    return "Student Number";
    break;
    case "grade":
    return "Grade";
    break;
    case "alum":
    return "Alumnus";
    break;
    case "admin":
    return "Admin";
    break;
    case "programName":
    return "Program";
    break;
    case "password":
    return "Password";
    break;
    case "class":
    return "Class";
    break;
    case "lastOnline":
    return "Last Online";
    break;
    case "dateRegistered":
    return "Date Registered";
    break;
    case "confirmEmailCode":
    return "Confirm Email Code";
    break;
    case "confirmedEmail":
    return "Confirmed Email";
    break;
    case "requestedPasswordReset":
    return "Requested Password Reset";
    break;
    case "passwordResetCode":
    return "Password Reset Code";
    break;
    case "decaCluster":
    return "Cluster";
    break;
    case "decaEvent":
    return "Event";
    break;
    case "examid":
    return "Exam ID";
    break;
    case "modulus":
    return "Modulus";
    break;
    case "increment":
    return "Increment";
    break;
    case "seed":
    return "Seed";
    break;
    case "multiplier":
    return "Multiplier";
    break;
    case "offset":
    return "Offset";
    break;
    case "correct":
    return "Correct";
    break;
    case "total":
    return "Total";
    break;
    case "percentage":
    return "Percentage";
    break;
    case "startTime":
    return "Start Time";
    break;
    case "endTime":
    return "End Time";
    break;
    case "examHash":
    return "Exam Hash";
    break;
    case "cluster":
    return "Exam Cluster";
    break;
    case "cancelled":
    return "Cancelled";
    break;
    case "name":
    return "Name";
    break;
    case "numQuestions":
    return "Num. Questions";
    break;
    case "dateCreated":
    return "Date Created";
    break;
    case "unlocked":
    return "Unlocked";
    break;
    case "showScore":
    return "Show Score";
    break;
    case "includeStats":
    return "Include Stats.";
    break;
    case "showTimer":
    return "Show Timer";
    break;
    default:
    return null;
  }
}

function valInObjInArr(arr, prop, val) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i][prop] == val) {
      return i;
    }
  }
  return null;
}

function removeDuplicates(myArr, prop) {
  return myArr.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
  });
}
