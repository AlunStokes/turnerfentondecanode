$(document).ready(function() {
  $("#change-password-btn").on('click', function() {
    getPasswordData(function(passwordData) {
      validatePasswordData(passwordData, function(err) {
        if (err) {
          notify(err, "warning", "exclamation");
          return;
        }
        submitPasswordData(passwordData, function(err) {
          if (err) {
            notify(err, "danger", "exclamation");
            return;
          }
          notify("Password successfully changed", "success", "check");
          resetPasswordForm();
          return;
        });
      });
    });
  });
});

function getPasswordData(callback) {
  passwordData = {
    password: $("#password-input").val(),
    passwordConfirm: $("#password-confirm-input").val()
  };
  callback(passwordData);
  return;
}

function validatePasswordData(passwordData, callback) {
  if (passwordData.password !== passwordData.passwordConfirm) {
    callback("Passwords must match");
    return;
  }
  for (var prop in passwordData) {
    if (typeof(passwordData[prop]) == "undefined" || passwordData[prop].length == 0) {
      callback("Please fill out all fields");
      return;
    }
    if (passwordData[prop].length < 8) {
      callback("Password must be at least 8 characters");
      return;
    }
  }
  callback(null);
  return;
}

function submitPasswordData(passwordData, callback) {
  $.ajax({
    type: "POST",
    url: "ajax",
    data: {
      ajaxid: "changePassword",
      password: passwordData.password
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

function resetPasswordForm() {
  $("#password-input").val("");
  $("#password-confirm-input").val("");
  return;
}
