var timeline = $("#timeline");

var firstIndex = 0;
var offset = 0;
var limit = 1000;

var editPostBoxArray = [];

var posts;

$(document).ready(function() {
  loadPosts(firstIndex, offset, limit);
});

function loadPosts(firstIndex, offset, limit) {
  $.ajax({
    type: "POST",
    url: "ajax",
    data: {
      ajaxid: "getTimelineData",
      firstIndex: firstIndex,
      offset: offset,
      limit: limit
    }
  }).done(function(data) {
    posts = data;
    var timelineHTML = "";
    for (var i = 0; i < data.length; i++) {

      data[i].class = valueToCluster(data[i].class);

      //Check if new date should be displayed
      //If not first post, and this message's date comes earlier than the previous OR if first post
      if ((i > 0 && data[i].date != data[i-1].date) || (i == 0)) {
        timelineHTML += '<div class="timeline-header"><div class="timeline-header-title bg-success">' + data[i].date + '</div></div>';
      }

      timelineHTML += buildPost(data[i].id, data[i].posterStudentNumber, data[i].time, data[i].posterFirstName, data[i].posterLastName, data[i].messageHTML, data[i].class);
    }

    $("#timeline").append(timelineHTML);
  });
}

//Wait for press of edit button
$(document).on('click', ".edit", function() {
  var postid = getNum(this.id);
  startEditPost(postid);
});

$(document).on('click', ".save-edit-btn", function() {
  var postid = getNum(this.id);
  finishEditPost(postid);
});

$(document).on('click', ".delete", function() {
  if (confirm("Are you sure you want to delete this post?")) {
    deletePost(getNum(this.id));
  }
});

function startEditPost(postid) {
  var index = getIndexById(posts, postid);
  var postBody = $("#post-body-" + postid);
  var postFooter = $("#post-footer-" + postid);
  var postClassValue = clusterToValue(posts[index].class);
  postBody.html('<textarea id="edit-post-textarea-' + postid + '"></textarea>');

  postFooter.html('<select class="form-control" id="post-class-' + postid + '" style="width:50%; display:inline;">' +
  '<option value="all">All Classes</option>' +
  '<option value="writtens">Writtens</option>' +
  '<option value="marketing">Marketing</option>' +
  '<option value="businessadmin">Business Administration</option>' +
  '<option value="finance">Finance</option>' +
  '<option value="hospitality">Hospitality & Tourism</option>' +
  '</select>' +
  '<button type="button" class="btn btn-default save-edit-btn" id="save-edit-btn-' + postid + '" style="display:inline; float:right;">Save Post</button>');

  $("#edit-" + postid).css("display", "none");
  $("#post-class-" + postid).val(postClassValue)
  editPostBoxArray[postid] = new SimpleMDE(
    {
      element: $("#edit-post-textarea-" + postid)[0],
      toolbar: ["bold", "italic", "heading", "strikethrough", "quote", "unordered-list", "ordered-list", "link", "|", "preview", "guide"],
      initialValue: posts[getIndexById(posts, postid)].messageMarkdown
    }
  );
}

function finishEditPost(postid) {
  var messageHTML = editPostBoxArray[postid].options.previewRender(editPostBoxArray[postid].value());
  var messageMarkdown = editPostBoxArray[postid].value();
  var messageClass = $("#post-class-" + postid).val();

  updatePost(postid, messageHTML, messageMarkdown, messageClass, function(err) {
    if (err) {
      return;
    }
    var index = getIndexById(posts, postid);
    posts[index].messageHTML = messageHTML;
    posts[index].messageMarkdown = messageMarkdown;
    posts[index].class = valueToCluster(messageClass);
    var newHTML = buildPost(postid, posts[index].posterStudentNumber, posts[index].time, posts[index].posterFirstName, posts[index].posterLastName, posts[index].messageHTML, posts[index].class);
    $("#post-" + postid).replaceWith(newHTML);
    editPostBoxArray[index] = null;
  });
}

function deletePost(postid) {
  var post = $("#post-" + postid);
  $.ajax({
    type: "POST",
    url: "ajax",
    data: {
      ajaxid: "deletePost",
      postid: postid
    }
  }).done(function(data) {
    if (data.err) {
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
      $.notify({
        icon: 'fa fa-check',
        message: "Post was successfully deleted"
      },
      {
        type: "success",
        timer: 3000,
        placement: {
          from: "bottom",
          align: "right"
        }
      });
      post.replaceWith("");
    }
  });
}

function updatePost(postid, messageHTML, messageMarkdown, messageClass, callback) {
  $.ajax({
    type: "POST",
    url: "ajax",
    data: {
      ajaxid: "updatePost",
      postid: postid,
      messageHTML: messageHTML,
      messageMarkdown: messageMarkdown,
      messageClass: messageClass
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
      //Gives error
      callback(data.err);
      return;
    }
    else {
      $.notify({
        icon: 'fa fa-check',
        message: "Post successfully edited"
      },
      {
        type: "success",
        timer: 3000,
        placement: {
          from: "bottom",
          align: "right"
        }
      });
      callback(null);
      return;
    }
  });
}

//Gets index in post array of post with given postid
function getIndexById(postArray, postid) {
  for (var i = 0; i < postArray.length; i++) {
    if (postArray[i].id == postid) {
      return i;
    }
  }
  return -1;
}

//Returns integers in a string
function getNum(string) {
  var num = string.match(/\d+/)[0];
  return num;
}

function buildPost(id, studentNumber, time, firstName, lastName, messageHTML, messageClass) {
  var post = "";

  //Start post body
  post += '<div class="timeline-entry" id="post-' + id + '"><div class="timeline-stat">';
  //Add user image
  post += '<div class="timeline-icon"><img src="images/users/thumbnail/' + studentNumber + '.jpg" alt="Profile picture"></div>';
  //Add timestamp
  post += '<div class="timeline-time">' + time + '</div>';
  //Close head/stat and start body
  post += '</div><div class="timeline-label">';
  if (admin) {
    //Add edit and delete buttons
    post += '<div><span class="delete" id="delete-' + id +'"><i class="fa fa-times"></i></span><span class="edit" id="edit-' + id +'"><i class="fa fa-pencil"></i></span></div>';
  }
  //Add message and finish post
  post += '<h4 class="text-info mar-no pad-btm">' + firstName + ' ' + lastName + '</h4><div class="timeline-post-body" id="post-body-' + id + '">' + messageHTML + '</div><div class="footer" id="post-footer-' +id + '"><hr style="margin-top:10px; margin-bottom:10px;" /><p class="text xsmall right" id="post-class-' + id + '">' + messageClass +'</p></div></div></div>';

  return post;
}

//Converts class (ex Business Administration) to value (ex businessadmin)
function clusterToValue (cluster) {
  switch(cluster) {
    case "All Clusters":
    return "all";
    break;
    case "Marketing":
    return "marketing";
    break;
    case "Finance":
    return "finance";
    break;
    case "Business Administration":
    return "businessadmin";
    break;
    case "Hospitality & Tourism":
    return "hospitality";
    break;
    case "Writtens":
    return "writtens";
    break;
    default:
    return "undefined"
  }
}

//Converts value (ex businessadmin) to class (ex Business Administration)
function valueToCluster (value) {
  switch(value) {
    case "all":
    return "All Clusters";
    break;
    case "marketing":
    return "Marketing";
    break;
    case "finance":
    return "Finance";
    break;
    case "businessadmin":
    return "Business Administration";
    break;
    case "hospitality":
    return "Hospitality & Tourism";
    break;
    case "writtens":
    return "Writtens";
    break;
    default:
    return "undefined"
  }
}
