$(document).ready(function() {
  $("#change-email-btn").on('click', function() {
    getEmail(function(email) {
      validateEmail(email, function(err) {
        if (err) {
          notify(err, "warning", "exclamation");
          return;
        }
        submitEmail(email, function(err) {
          if (err) {
            notify(err, "danger", "exclamation");
            return;
          }
          notify("Email successfully changed", "success", "check");
          resetEmailForm();
          return;
        });
      });
    });
  });
});

function getEmail(callback) {
  callback($("#email-input").val());
  return;
}

function validateEmail(email, callback) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!re.test(email)) {
    callback("Email is improperly formatted");
    return;
  }
  callback(null);
  return;
}

function submitEmail(email, callback) {
  $.ajax({
    type: "POST",
    url: "ajax",
    data: {
      ajaxid: "changeEmail",
      email: email
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

function resetEmailForm() {
  $("#email-input").val("");
  return;
}
