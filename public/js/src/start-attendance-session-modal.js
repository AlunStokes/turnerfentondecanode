var optionAInput;
var optionBInput;
var optionCInput;
var optionDInput;
var answerInput;

var confirmStartBtn;

var startInstructions;

var optionA;
var optionB;
var optionC;
var optionD;
var answer;

$(document).ready(function() {
  optionAInput = $("#option-input-A");
  optionBInput = $("#option-input-B");
  optionCInput = $("#option-input-C");
  optionDInput = $("#option-input-D");
  answerInput = $("#answer-input");

  confirmStartBtn = $("#confirm-start-session-btn");

  startInstructions = $("#start-instructions");

  confirmStartBtn.on('click', function() {
    getSessionData(function(sessionData) {
      validateSessionData(sessionData, function(err) {
        if (err) {
          notify(err, "warning", "exclamation");
          return;
        }
        submitSessionData(sessionData, function(err) {
          if (err) {
            notify(err, "danger", "exclamation");
            return;
          }
          notify("Session successfully started", "success", "check");
          resetForm();
          return;
        });
      });
    });
  });
});

function prepStartModal(callback) {
  checkSession(function(err, currentSession) {
    if (err) {
      notify(err, "danger", "exclamation");
      return;
    }
    if (currentSession) {
      optionAInput.attr('disabled', true);
      optionBInput.attr('disabled', true);
      optionCInput.attr('disabled', true);
      optionDInput.attr('disabled', true);
      answerInput.attr('disabled', true);
      confirmStartBtn.attr('disabled', true);
      startInstructions.before("<h1 class='text thin medium center red'>Session already in progress - you may not start another</h1>");
    }
    callback();
    return;
  });
}

function getSessionData(callback) {
  var sessionData = {
    optionA: optionAInput.val(),
    optionB: optionBInput.val(),
    optionC: optionCInput.val(),
    optionD: optionDInput.val(),
    answer: answerInput.val(),
  };
  callback(sessionData);
  return;
}

function checkSession(callback) {
  $.ajax({
    type: "GET",
    url: "ajax",
    data: {
      ajaxid: "getAttendanceSession"
    }
  }).done(function(data) {
    if (data.err) {
      callback(data.err);
      return;
    }
    callback(null, data.currentSession);
    return;
  })
}

function validateSessionData(sessionData, callback) {
  var specChar = /\`|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\+|\=|\[|\{|\]|\}|\||\\|\'|\<|\,|\.|\>|\?|\/|\""|\;|\:/g;
  for (var prop in sessionData) {
    //If empty
    if (typeof(sessionData[prop]) == "undefined" || sessionData[prop].length == 0) {
      callback("All fields must be filled");
      return;
    }
    //If any whitespace
    if (sessionData[prop].indexOf(' ') >= 0) {
      callback("No spaces are allowed - single words only");
      return;
    }
    if (sessionData[prop].length > 10) {
      callback("No more than 10 characters may be used per option");
      return;
    }
    if (specChar.test(sessionData[prop])) {
      callback("No special chatacters allowed");
      return;
    }
  }
  var options = [
    sessionData.optionA,
    sessionData.optionB,
    sessionData.optionC,
    sessionData.optionD
  ]
  if (hasDuplicates(options)) {
    callback("No two options may be the same");
    return;
  }
  callback(null);
  return;
}

function submitSessionData(sessionData, callback) {
  $.ajax({
    type: "POST",
    url: "ajax",
    data: {
      ajaxid: "startAttendanceSession",
      sessionData: JSON.stringify(sessionData)
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
  optionAInput.val("");
  optionBInput.val("");
  optionCInput.val("");
  optionDInput.val("");
  answerInput.val("A");
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
