var questionInput;
var optionAInput;
var optionBInput;
var optionCInput;
var optionDInput;
var answerInput;
var clusterInput;

var submitQuestionBtn;
var newQuestionBtn;

$(document).ready(function() {
  questionInput = $("#question-input");
  optionAInput = $("#option-a-input");
  optionBInput = $("#option-b-input");
  optionCInput = $("#option-c-input");
  optionDInput = $("#option-d-input");
  answerInput = $("#answer-input");
  clusterInput = $("#cluster-input");

  submitQuestionBtn = $("#submit-question");
  newQuestionBtn = $("#new-question");

  submitQuestionBtn.on('click', function() {
    getQuestionData(function(questionData) {
      validateQuestion(questionData, function(err) {
        if (err) {
          notify(err, "danger", "exclamation");
          return;
        }
        submitQuestion(questionData, function(err) {
          if (err) {
            notify(err, "danger", "exclamation");
            return;
          }
          notify("Question was successfully submitted", "success", "check");
          resetForm();
          return;
        });
      });
    });
  });

  newQuestionBtn.on('click', function() {
    resetForm();
  });

});

function getQuestionData(callback) {
  var questionData = {};
  questionData.question = questionInput.val();
  questionData.optionA = optionAInput.val();
  questionData.optionB = optionBInput.val();
  questionData.optionC = optionCInput.val();
  questionData.optionD = optionDInput.val();
  questionData.answer = answerInput.val();
  questionData.cluster = clusterInput.val();
  callback(questionData);
  return;
}

function validateQuestion(questionData, callback) {
  for (var prop in questionData) {
    if (typeof(questionData[prop]) == "undefined" || questionData[prop].length == 0) {
      callback("All fields must be filled");
      return;
    }
  }
  var options = [questionData.optionA, questionData.optionB, questionData.optionC, questionData.optionD];
  if (hasDuplicates(options)) {
    callback("No two options may be the same");
    return;
  }
  if (questionData.question == questionData.optionA || questionData.question == questionData.optionB || questionData.question == questionData.optionC || questionData.question == questionData.optionD) {
    callback("Your question must not be the same as one of your options");
    return;
  }
  callback(null);
}

function submitQuestion(questionData, callback) {
  $.ajax({
    type: "POST",
    url: "ajax",
    data: {
      ajaxid: "submitNewQuestion",
      questionData: JSON.stringify(questionData)
    }
  }).done(function(data) {
    if (data.err) {
      callback(data.err);
      return;
    }
    callback(null);
    return;
  });
}

function resetForm() {
  questionInput.val("");
  optionAInput.val("");
  optionBInput.val("");
  optionCInput.val("");
  optionDInput.val("");
  answerInput.val("A");
  clusterInput.val("marketing");
}

function hasDuplicates(arr)  {
  var newArr = arr.sort();
  for (var i = 0; i < newArr.length; i++) {
    if (newArr.indexOf(newArr[i]) !== newArr.lastIndexOf(newArr[i])) {
      return true;
    }
  }
  return false;
}
