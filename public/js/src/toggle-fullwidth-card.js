$(document).ready(function() {

  $("#fullwidth-switch").on('change', function() {
    toggleFullwidth();
    if (this.checked) {
      $("#fullwidth-text").html("Fullwidth");
      $("#top-div").addClass("container-fullwidth");
      $("#top-div").removeClass("container");
    }
    else {
      $("#fullwidth-text").html("Boxed");
      $("#top-div").removeClass("container-fullwidth");
      $("#top-div").addClass("container");
    }
  });

});

function toggleFullwidth() {
  $.ajax({
    type: "POST",
    url: "ajax",
    data: {
      ajaxid: "toggleFullwidth",
    }
  }).done(function(data) {
    if (data.err) {
      notify(err, "warning", "exclamation");
      return;
    }
    notify("Successfully toggled", "success", "check");
  });
}
