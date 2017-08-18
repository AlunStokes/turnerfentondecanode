var extensionInput = $("#extension-input");
var extensionForm = $("#submitExtensionForm");
var errorText = $("#error");
$("#submitExtensionForm").on("submit", function(evt) {
  errorText.html("");
  evt.preventDefault();
  var ext = extensionInput.val();
  if (!ext.match(/^[t]\w*\s[f]\w*\s[d]\w*$/)) {
    $.notify({
      icon: 'fa fa-exclamation',
      message: "Extension doesn't match rules."
    },
    {
      type: "danger",
      timer: 3000,
      placement: {
        from: "bottom",
        align: "right"
      }
    });
  }
  else {
    $.ajax({
      type: "POST",
      url: "ajax",
      data: {
        ajaxid: "submitExtension",
        extension: ext.toLowerCase()
      }
    }).done(function(data) {
      if(data.err) {
        $.notify({
          icon: 'fa fa-paper-plane',
          message: "Server error - try again later."
        },
        {
          type: "danger",
          timer: 3000,
          placement: {
            from: "bottom",
            align: "right"
          }
        });
      }
      else if (data.duplicate) {
          $.notify({
            icon: 'fa fa-paper-plane',
            message: "That exact extension has already been submitted."
          },
          {
            type: "warning",
            timer: 3000,
            placement: {
              from: "bottom",
              align: "right"
            }
          });
      }
      else {
        $.notify({
          icon: 'fa fa-paper-plane',
          message: "Your extension has been submitted for review."
        },
        {
          type: "success",
          timer: 3000,
          placement: {
            from: "bottom",
            align: "right"
          }
        });
      }
    });
  }
});
