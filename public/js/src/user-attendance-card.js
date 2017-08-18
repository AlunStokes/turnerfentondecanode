var options = ["A", "B", "C", "D"];

var clicked = [0, 0, 0, 0];
var tries = 0;
var active = true;
var submitted = false;

var shownInfoCount = 0;


$(document).ready(function() {
  loadAttendance(function(err, attendanceData) {
    if (err) {
      notify("Error loading attendance - try again later", "danger", "exclamation");
      return;
    }
    if (!attendanceData.attendanceOpen) {
      active = false;
      $("#attendance-status").text("No attendance session is currently open");
      $("#attendance-icon").removeClass("icon-success").addClass("icon-danger");
      return;
    }
    if (attendanceData.attendanceCompleted) {
      $("#attendance-status").text("Your attendance has been logged");
      submitted = true;
      active = false;
      $("#attendance-option-" + attendanceData.attendanceAnswer).addClass("attendance-confirmed");
      insertAttendanceQuestions(attendanceData.attendanceOptions);
      return;
    }
    else {
      if (attendanceData.triesLeft == 0) {
        tries = 2;
        active = false;
        $("#attendance-status").text("You have been locked out of this session");
        insertAttendanceQuestions(attendanceData.attendanceOptions);
      }
      else if (attendanceData.triesLeft != 2) {
        tries = 2 - attendanceData.triesLeft;
        $("#attendance-status").text("You have " + attendanceData.triesLeft + " try left");
        insertAttendanceQuestions(attendanceData.attendanceOptions);
      }
      else {
        tries = 2 - attendanceData.triesLeft;
        $("#attendance-status").text("A session is currently open");
        insertAttendanceQuestions(attendanceData.attendanceOptions);
      }
    }
  });
});

function insertAttendanceQuestions(options) {
  $("#attendance-option-A").text(options.optionA);
  $("#attendance-option-B").text(options.optionB);
  $("#attendance-option-C").text(options.optionC);
  $("#attendance-option-D").text(options.optionD);
  return;
}

$(document).on('click touchstart', '.attendance-option', function() {
  if (tries >= 2 || submitted || !active) {
    return;
  }
  var option = this.id.charAt(this.id.length - 1);
  var timesClicked = clicked[options.indexOf(option)];
  if (timesClicked == 0) {
    selectOption(option);
  }
  else if (timesClicked == 1) {
    confirmOption(option);
  }
});

function loadAttendance(callback) {
  $.ajax({
    type: "GET",
    url: "ajax",
    data: {
      ajaxid: "getAttendanceData"
    }
  }).done(function(data) {
    if (data.err) {
      callback(data.err);
      return;
    }
    callback(null, data);
  });
}

function selectOption(option) {
  var index = options.indexOf(option);
  clicked.setAll(0);
  clicked[index] = 1;
  if (shownInfoCount < 2) {
    notify("Click the option again to confirm your choice", "info", "check");
    shownInfoCount++;
  }
  updateClasses();
}

function confirmOption(option) {
  var index = options.indexOf(option);
  clicked.setAll(0);
  clicked[index] = 2;
  tries++;
  submitted = true;
  updateClasses();
  checkAnswer(function(err, correct) {
    if (err) {
      notify(err, "danger", "exclamation");
      return;
    }
    if (correct) {
      notify("Your attendance has been logged", "success", "check");
      $("#attendance-status").text("Your attendance has been logged");
      return;
    }
    else {
      if (tries == 1) {
        notify("That is not the correct option", "warning", "exclamation");
        $("#attendance-status").text("You have 1 more try");
      }
      else {
        notify("You have been locked out of this attendance session", "danger", "exclamation");
        $("#attendance-status").text("You have been locked out of this session");
      }
      $("#attendance-option-" + option).addClass("attendance-incorrect");
      setTimeout(function() {
        resetAttendance();
      }, 800);
    }
  });
}

function resetAttendance() {
  submitted = false;
  clicked.setAll(0);
  updateClasses();
}

function checkAnswer(callback) {
  $.ajax({
    type: "POST",
    url: "ajax",
    data: {
      ajaxid: "checkAttendanceAnswer",
      answer: options[clicked.indexOf(2)]
    }
  }).done(function(data) {
    if (data.err) {
      callback(data.err);
      return;
    }
    callback(null, data.correct);
    return;
  });
}

function updateClasses() {
  for (var i = 0; i < clicked.length; i++) {
    if (clicked[i] == 0) {
      $("#attendance-option-" + options[i]).removeClass("attendance-selected");
      $("#attendance-option-" + options[i]).removeClass("attendance-confirmed");
      $("#attendance-option-" + options[i]).removeClass("attendance-incorrect");
    }
    else if (clicked[i] == 1) {
      $("#attendance-option-" + options[i]).addClass("attendance-selected");
      $("#attendance-option-" + options[i]).removeClass("attendance-confirmed");
      $("#attendance-option-" + options[i]).removeClass("attendance-incorrect");
    }
    else if (clicked[i] == 2) {
      $("#attendance-option-" + options[i]).removeClass("attendance-selected");
      $("#attendance-option-" + options[i]).addClass("attendance-confirmed");
      $("#attendance-option-" + options[i]).removeClass("attendance-incorrect");
    }
  }
  return;
}

Array.prototype.setAll = function(v) {
  var i, n = this.length;
  for (i = 0; i < n; ++i) {
    this[i] = v;
  }
}
