var timeline = $("#timeline");

var firstIndex = 0;
var offset = 0;
var limit = 25;

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
  var timelineHTML = "";
  for (var i = 0; i < data.length; i++) {

    //Check if new date should be displayed
    //If not first post, and this message's date comes earlier than the previous OR if first post
    if ((i > 0 && data[i].date != data[i-1].date) || (i == 0)) {
      timelineHTML += '<div class="timeline-header"><div class="timeline-header-title bg-success">' + data[i].date + '</div></div>';
    }

    //Start post body
    timelineHTML += '<div class="timeline-entry"><div class="timeline-stat">';

    //Add user image
    timelineHTML += '<div class="timeline-icon"><img src="images/users/thumbnail/' + data[i].posterStudentNumber + '.jpg" alt="Profile picture"></div>';

    //Add timestamp
    timelineHTML += '<div class="timeline-time">' + data[i].time + '</div>';

    //Close head/stat and start body
    timelineHTML += '</div><div class="timeline-label">';

    //Add message and finish post
    timelineHTML += '<h4 class="text-info mar-no pad-btm">' + data[i].posterFirstName + ' ' + data[i].posterLastName + '</h4><div class="timeline-post-body">' + data[i].messageHTML + '</div></div></div>';
  }

  $("#timeline").append(timelineHTML);
});
