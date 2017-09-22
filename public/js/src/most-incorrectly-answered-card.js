var generalIncorrectCard;
var generalIncorrectQuestionArea;
var submitQuestionBtn;

var generalAnswer;

var questionid;

$(document).ready(function() {

  generalIncorrectCard = $("#general-incorrectly-answered-card");
  generalIncorrectQuestionArea = $("#general-incorrectly-answered-question-area");
  submitQuestionBtn = $("#general-submit-question-btn");

  $.ajax({
    type: "GET",
    url: "ajax",
    data: {
      ajaxid: "getMostIncorrectlyAnswered"
    }
  }).done(function(data) {
    if (data.err) {
      generalIncorrectCard.css("display", "none");
      return;
    }
    questionid = data.questionid;

    $.ajax({
      type: "GET",
      url: "ajax",
      data: {
        ajaxid: "getQuestionNoAnswer",
        questionid: questionid
      }
    }).done(function(data) {
      if (data.err) {
        generalIncorrectCard.css("display", "none");
        return;
      }

      generalIncorrectQuestionArea.html(generateQuestionHTMLNonNum(data.question));

    });
  });

  $(document).on('change', 'input[type="radio"]', function() {
    generalAnswer = this.value;
    $('#general-given-answer').html(this.value);
    //Check if submit button should be disabled/enable
    if (generalAnswer) {
      if (submitQuestionBtn.prop('disabled')) {
        submitQuestionBtn.prop('disabled', false);
      }
    }
    else {
      if (!submitQuestionBtn.prop('disabled')) {
        submitQuestionBtn.prop('disabled', true);
      }
    }
  });

  submitQuestionBtn.on('click', function() {
    submitQuestion();
  });

});

function submitQuestion() {
  $.ajax({
    type: "GET",
    url: "ajax",
    data: {
      ajaxid: "getQuestionAnswer",
      questionid: questionid
    }
  }).done(function(data) {
    if (data.err) {
      notify("Server error - try again later", "warning", "exclamation");
      return;
    }
    if (data.answer == generalAnswer) {
      $("#general-given-answer").css("color", "#5cb85c");
      $("label[for='general-rb-" + generalAnswer + "']").children().css("color", "#5cb85c");
      notify("Correct", "success", "check");
    }
    else {
      $("#general-given-answer").css("color", "#d9534f");
      $("label[for='general-rb-" + data.answer + "']").children().css("color", "#5cb85c");
      $("label[for='general-rb-" + generalAnswer + "']").children().css("color", "#d9534f");
      notify("Incorrect", "danger", "times");
    }
    $("input[type=radio][name='general-rb']").attr('disabled', true);
    submitQuestionBtn.prop('disabled', true);
  });
}


function generateQuestionHTMLNonNum(question) {
  var html = '';
  var optionLetters = ['A', 'B', 'C', 'D'];
    html += '<div class="question">' +
    '<div class="row">' +
    '<div class="col-lg-9 col-xs-10">' +
    '<h1 class="text small thin dark">' + question.question + '</h1>' +
    '</div>' +
    '<div class="col-lg-1 col-lg-offset-1 col-xs-2">' +
    '<h1 class="text large thick dark" id="general-given-answer"></h1>' +
    '</div>' +
    '</div>' +
    '<br>';
    //Add options
    for (var j = 0; j < 4; j++) {
      html += '<div class="row">' +
      '<div class="col-lg-1 col-xs-2">' +
      '<input type="radio" name="general-rb" id="general-rb-' + optionLetters[j] + '" value="' + optionLetters[j] + '">' +
      '</div>' +
      '<div class="col-lg-8 col-xs-10">' +
      '<label for="general-rb-' + optionLetters[j] + '">' +
      '<h1 class="text small thin dark"><i><b>' + optionLetters[j] + '. </b></i>' + question['option' + optionLetters[j]] + '</h1>' +
      '</div>' +
      '</div>';
    }
    html += '</div>';
  return html;
}
