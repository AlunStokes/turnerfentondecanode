$(document).ready(function() {

  //Stop submission if input empty
  var input = $("input");
  $("#login-form").on("submit", function(evt) {
    for (var i = 0; i < input.length; i++) {
      if (input[i].value == "") {
        evt.preventDefault();
      }
    }
  });
});
