var modalBody;

$(document).ready(function() {
  modalBody = $("#modal-body");
  return;
});

function prepEndModal(callback) {
  checkSession(function(err, currentSession) {
    if (err) {
      notify(err, "danger", "exclamation");
      return;
    }
    if (currentSession) {
      var htmlBody = '';

      htmlBody += '<div class="row">' +
      '<div class="col-xs-12 col-lg-12 ignore">' +
      '<h1 class="text thin medium center">Started on ' + currentSession.startTime + '</h1>' +
      '</div>' +
      '</div>' +
      '<br>' +
      '<div class="row">' +
      '<div class="col-xs-6 col-lg-6 ignore">' +
      '<h1 class="text thin small dark italic center" id="option-A-title">Option A:</h1>' +
      '<h1 class="text thin small dark center" id="option-A-value">' + currentSession.optionA + '</h1>' +
      '</div>' +
      '<div class="col-xs-6 col-lg-6 ignore">' +
      '<h1 class="text thin small dark italic center" id="option-B-title">Option B:</h1>' +
      '<h1 class="text thin small dark center" id="option-B-value">' + currentSession.optionB + '</h1>' +
      '</div>' +
      '</div>' +
      '<br />' +
      '<div class="row">' +
      '<div class="col-xs-6 col-lg-6 ignore">' +
      '<h1 class="text thin small dark italic center" id="option-C-title">Option C:</h1>' +
      '<h1 class="text thin small dark center" id="option-C-value">' + currentSession.optionC + '</h1>' +
      '</div>' +
      '<div class="col-xs-6 col-lg-6 ignore">' +
      '<h1 class="text thin small dark italic center" id="option-D-title">Option D:</h1>' +
      '<h1 class="text thin small dark center" id="option-D-value">' + currentSession.optionD + '</h1>' +
      '</div>' +
      '</div>' +
      '<br />' +
      '<div class="row">' +
      '<div class="col-xs-12 col-lg-12 ignore">' +
      '<button class="btn btn-lg btn-block active-color" id="confirm-end-session-btn">End session</button>' +
      '</div>' +
      '</div>';

      modalBody.html(htmlBody);
      $("#option-" + currentSession.answer + "-title, #option-" + currentSession.answer + "-value").addClass("green");

    }
    callback();
    return;
  });
}

$(document).on('click', "#confirm-end-session-btn", function() {
  endSession(function(err) {
    if (err) {
      notify(err, "danger", "exclamation");
      return;
    }
    notify("Session successfully ended", "success", "check");
    resetEndModal();
  });
});

function resetEndModal() {
  var html = '<div class="row">' +
  '<div class="col-xs-12 col-lg-12">' +
  '<h1 class="text small thin center dark">No session is currently in progress - click on the start session card to make one.</h1>' +
  '</div>' +
  '</div>';

  modalBody.html(html);
  return;
}

function endSession(callback) {
  $.ajax({
    type: "POST",
    url: "ajax",
    data: {
      ajaxid: "endAttendanceSession"
    }
  }).done(function(data) {
    if (data.err) {
      callback(data.err);
      return;
    }
    callback(null);
  });
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
  });
}
