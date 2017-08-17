var submitPostBtn = $("#submit-post-btn");

var newPostBox = new SimpleMDE(
  {
    element: $("#new-post-box")[0],
    toolbar: ["bold", "italic", "heading", "strikethrough", "quote", "unordered-list", "ordered-list", "link", "|", "preview", "guide"]
  }
);

newPostBox.codemirror.on("change", function(){
	if (newPostBox.value() == "") {
    if (!submitPostBtn.prop('disabled')) {
      submitPostBtn.prop('disabled', true);
    }
  }
  else {
    if (submitPostBtn.prop('disabled')) {
      submitPostBtn.prop('disabled', false);
    }
  }
});
submitPostBtn.on("click", function() {
  $.ajax({
    type: "POST",
    url: "ajax",
    data: {
      ajaxid: "submitNewPost",
      messageHTML: newPostBox.options.previewRender(newPostBox.value()),
      messageMarkdown: newPostBox.value(),
      messageClass: $("#post-class").val()
    }
  }).done(function(data) {
    if(data.err) {
      $.notify({
        icon: 'fa fa-exclamation-triangle',
        message: data.err
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
      newPostBox.value("");
      $("#post-class").val("all");
      $.notify({
        icon: 'fa fa-check',
        message: "Your post was successfully posted"
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
});
