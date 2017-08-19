$(document).ready(function() {

  var questions;
  var givenAnswers = Array($(".question").length);
  givenAnswers.setAll("");
  var submitExamBtn = $("#submit-exam-btn");

  try {
    $("#timer").startTimer({
      onComplete: submitExam
    });
  } catch(e) {

  }

  //Notify server via websockets that user has exam page open (every minute)
  socket.emit("writingExam", studentNumber);
  setInterval(function() {
    socket.emit("stillWritingExam", studentNumber);
  }, 60000);

  //Updates letter of chosen answer beside question
  $('input[type="radio"]').change(function() {
    var num = getNum(this.id);
    givenAnswers[num] = this.value;
    $('#given-answer-' + num).html(this.value);
    //Check if submit button should be disabled/enable
    if (count(givenAnswers) == $(".question").length) {
      if (submitExamBtn.prop('disabled')) {
        submitExamBtn.prop('disabled', false);
      }
    }
    else {
      if (!submitExamBtn.prop('disabled')) {
        submitExamBtn.prop('disabled', true);
      }
    }
  });

  //Returns integers in a string
  function getNum(string) {
    var num = string.match(/\d+/)[0];
    return num;
  }

  function count(array) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
      if (typeof(array[i]) != 'undefined') {
        count++;
      }
    }
    return count;
  }

  submitExamBtn.on('click', function() {
    //If not all questions answered
    if (count(givenAnswers) < $(".question").length) {
      submitExamBtn.prop('disabled', true);
      notify("Answer all questions before submitting", "warning", "exclamation");
    }
    else {
      submitExam();
    }
  });


  function submitExam() {
    $.ajax({
      type: "POST",
      url: "ajax",
      data: {
        ajaxid: "checkExam",
        givenAnswers: JSON.stringify(givenAnswers)
      }
    }).done(function(data) {
      if (data.err) {
        notify(data.err, "danger", "exclamation");
        return;
      }
      if (!data.showScore) {
        notify("Your exam score is not shown for this exam, but it has been submitted and you may leave the page.", "success", "check");
        $("html, body").animate({ scrollTop: 0 }, "slow");
        return;
      }
      var answers = data.answers;
      var numCorrect = 0;
      submitExamBtn.prop('disabled', true);
      $("input:radio").attr("disabled", "disabled");
      for (var i = 0; i < answers.length; i++) {
        if (givenAnswers[i] == answers[i]) {
          numCorrect++;
          $("#given-answer-" + i).css("color", "#5cb85c");
        }
        else {
          $("#given-answer-" + i).css("color", "#d9534f");
          $("#given-answer-" + i).html(
            '<p>Your Answer: </p>' +
            givenAnswers[i] +
            '<br />' +
            '<p>Correct Answer: </p>' +
            answers[i]);
          }
        }
        $("#score").html(numCorrect + '/' + answers.length + " answered correctly");
        if (numCorrect/answers.length >= 0.8) {
          $("#score").css("color", "#5cb85c");
        }
        else if (numCorrect/answers.length >= 0.65) {
          $("#score").css("color", "#f0ad4e");
        }
        else {
          $("#score").css("color", "#d9534f");
        }
        notify("Your exam has been submitted.  You may leave the page.", "success", "check");
        $("html, body").animate({ scrollTop: 0 }, "slow");
      });
    }


    //Generates HTML to be inserted into questions div
    function generateQuestionHTML(questions) {
      var html = '';
      var optionLetters = ['A', 'B', 'C', 'D'];
      for (var i = 0; i < questions.length; i++) {
        html += '<div class="question">' +
        '<div class="row">' +
        '<div class="col-lg-9 col-xs-10">' +
        '<h1 class="text medium thin dark"><i><b>' + (i + 1) + '. </b></i>' + questions[i].question + '</h1>' +
        '</div>' +
        '<div class="col-lg-1 col-lg-offset-2 col-xs-2">' +
        '<h1 class="text large thick dark" id="given-answer-' + i + '"></h1>' +
        '</div>' +
        '</div>' +
        '<br>';
        //Add options
        for (var j = 0; j < 4; j++) {
          html += '<div class="row">' +
          '<div class="col-lg-1 col-xs-2">' +
          '<input type="radio" name="rb-' + i + '" id="rb-' + i + '-' + optionLetters[j] + '" value="' + optionLetters[j] + '">' +
          '</div>' +
          '<div class="col-lg-8 col-xs-10">' +
          '<label for="rb-' + i + '-' + optionLetters[j] + '">' +
          '<h1 class="text small thin dark"><i><b>' + optionLetters[j] + '. </b></i>' + questions[i]['option' + optionLetters[j]] + '</h1>' +
          '</div>' +
          '</div>';
        }
        html += '<hr>' +
        '</div>';
      }
      return html;
    }

  });
