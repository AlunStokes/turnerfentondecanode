var questionsAnsweredText = $("#questionsAnswered");
  $.ajax({
    url: "ajax",
    type: "GET",
    data: {
      ajaxid: "questionsAnswered"
    }
  }).done(function(data) {
    if (!data.err) {
      questionsAnsweredText.html(data.numQuestionsAnswered);
    }
  });
