var examsSearch = "";
var examsCluster = "mix";
var examsPer = 25;

var examsLoaded = 0;
var loadedExams = [];

var examsSeachInput;
var examsClusterInput;
var examsArea;

$(document).ready(function() {

  examsSeachInput = $("#exams-search-input");
  examsClusterInput = $("#exam-cluster-input");
  examsArea = $("#exams-area");

  //Initialise questions
  loadExams(examsCluster, examsSearch, examsLoaded, function(examList) {
    addExams(examList);
  });


  $(document).on('click', "#load-more-exams", function() {
    loadExams(examsCluster, examsSearch, examsLoaded, function(examList) {
      addExams(examList);
    });
  });

  examsSeachInput.on('keyup', function() {
    examsSearch = examsSeachInput.val();
    //Set to zero to reset num questions
    examsLoaded = 0;
    loadExams(examsCluster, examsSearch, examsLoaded, function(examList) {
      replaceExams(examList);
    });
  });

  examsClusterInput.on('change', function() {
    examsCluster = examsClusterInput.val();
    //Set to zero to reset num questions
    examsLoaded = 0;
    loadExams(examsCluster, examsSearch, examsLoaded, function(examList) {
      replaceExams(examList);
    });
  });

  $(document).on('click', '.btn-start-exam', function() {
    var id = getNum(this.id);
  });

  $(document).on('change', '.slider', function() {
    var examid = getNum(this.id);
    switchUnlock(examid, function(err) {
      if (err) {
        notify(err, "danger", "exclamation");
        return;
      }
      if ($("#lock-text-" + examid).text() == "Locked") {
        $("#lock-text-" + examid).text("Unlocked");
      }
      else {
        $("#lock-text-" + examid).text("Locked");
      }
    });
  });


});

function switchUnlock(examid, callback) {
  $.ajax({
    type: "POST",
    url: "ajax",
    data: {
      ajaxid: "switchExamLock",
      examid: examid
    }
  }).done(function(data){
    if (data.err) {
      callback(data.err)
      return;
    }
    callback(null);
  });
}

function loadExams(cluster, search, offset, callback) {
  $.ajax({
    type: "GET",
    url: "ajax",
    data: {
      ajaxid: "searchExams",
      cluster: cluster,
      search: search,
      offset: offset,
      examsPer: examsPer
    }
  }).done(function(data) {
    if (data.err) {
      notify(data.err);
      notify("Server error - try again later", "danger", "exclamation");
      return;
    }
    examsLoaded += data.length;
    loadedExams = loadedExams.concat(data);
    callback(data);
    return;
  });
}

function addExams(exams) {
  //Remove current load more button
  if ($("#load-more-exams")) {
    $("#load-more-exams").remove();
  }
  var html = '';
  if (exams.length == 0) {
    html = '<h1 class="text small thin dark">no more results</h1>';
  }
  else {
    html += generateExamsHTML(exams);
    //Add more button
    html += '<button class="btn btn-lg btn-block active-color" id="load-more-exams">Load more</button>';
  }
  examsArea.append(html);
}

function replaceExams(exams) {
  examsLoaded = examsPer;
  var html = '';
  if (exams.length == 0) {
    html = '<h1 class="text small thin dark">0 results returned</h1>';
  }
  else {
    html += generateExamsHTML(exams);
    //Add more button
    html += '<button class="btn btn-lg btn-block active-color" id="load-more-exams">Load more</button>';
  }
  examsArea.html(html);
}



function generateExamHTML(exam) {
  var html = '';
  html += '<div class="row exam">';
  if (admin) {
  html += '<div class="row">' +
  '<div class="col-xs-6 col-lg-6">' +
  '<h3 class="truncate text thin dark small left">' + exam.name + '</h3>' +
  '<p class="text thin dark xsmall left">' + exam.cluster + '</p>' +
  '<p class="text thin dark xsmall left">' + exam.numQuestions + ' Questions</p>' +
  '</div>';
    if (exam.unlocked) {
      html += '<div class="col-xs-6 col-lg-6" style="text-align: right;">' +
      '<label class="switch">' +
      '<input type="checkbox" class="slider" id="unlocked-exam-' + exam.id + '" checked>' +
      '<div class="slider round"></div>' +
      '</label>' +
      '<i><p id="lock-text-' + exam.id + '">Unlocked</p></i>' +
      '</div>' +
      '</div>';
    }
    else {
      html += '<div class="col-xs-6 col-lg-6" style="text-align: right;">' +
      '<label class="switch">' +
      '<input type="checkbox" class="slider" id="locked-exam-' + exam.id + '">' +
      '<div class="slider round"></div>' +
      '</label>' +
      '<i><p id="lock-text-' + exam.id + '">Locked</p></i>' +
      '</div>' +
      '</div>';
    }
    if (!exam.showScore) {
      html += '<div class="row">' +
      '<div class="col-xs-6 col-lg-6">' +
      '<p class="text thin dark xsmall italic">Score will not be shown</p>' +
      '</div>';
    }
    else {
      html += '<div class="row">' +
      '<div class="col-xs-6 col-lg-6">' +
      '</div>';
    }
    html += '<div class="col-xs-6 col-lg-6">' +
    '<form method="POST" action="exam">' +
    '<button class="btn btn-start-exam active-color" style="float:right" id="start-exam-' + exam.id + '"> Start Exam </button>' +
    '<input type="hidden" name="examid" value="' + exam.id + '" />' +
    '</form>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<hr width="60%"></hr>';
  }
  else {
    html += '<div class="row">' +
    '<div class="col-xs-6 col-lg-6">' +
    '<h3 class="truncate text thin dark small left">' + exam.name + '</h3>' +
    '<p class="text thin dark xsmall left">' + exam.cluster + '</p>' +
    '<p class="text thin dark xsmall left">' + exam.numQuestions + ' Questions</p>' +
    '</div>' +
    '</div>';
    if (!exam.showScore) {
      html += '<div class="row">' +
      '<div class="col-xs-6 col-lg-6">' +
      '<p class="text thin dark xsmall italic">Score will not be shown</p>' +
      '</div>';
    }
    else {
      html += '<div class="row">' +
      '<div class="col-xs-6 col-lg-6">' +
      '</div>';
    }
    html += '<div class="col-xs-6 col-lg-6">';
    if (exam.unlocked) {
      html += '<form method="POST" action="exam">' +
      '<button class="btn btn-start-exam active-color" style="float:right" id="start-exam-' + exam.id + '"> Start Exam </button>' +
      '<input type="hidden" name="examid" value="' + exam.id + '" />' +
      '</form>';
    }
    else {
      html += '<button class="btn btn-start-exam active-color" style="float:right" id="start-exam-' + exam.id + '" disabled> Start Exam </button>';
    }
    html += '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<hr width="60%"></hr>';
  }
  return html;
}

function generateExamsHTML(exams) {
  var html = '';
  for (var i = 0; i < exams.length; i++) {
    html += generateExamHTML(exams[i]);
  }
  return html;
}
