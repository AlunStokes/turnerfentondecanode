var loadQuestionsCluster;
var searchInput;
var questionAreaNotAdded;
var questionAreaAdded;

var examCluster = "mix";
var examUnlocked = 1;
var examShowScore = 1;
var examName;


//Holds questions that have been added to the exam
var inExam = [];
//Holds questions that are currently loaded through the search AND not in the exam
var loadedQuestions = [];
//List of integer indicies of loaded questions, regardless of in which question area they are held
var loadedIndices = [];
//List of integer indicies of loaded questions, currently in not added
var searchIndicies = [];

//Number of questions currently loaded
var questionsLoaded = 0;
//Number of questions to be fetched per search
var questionsPer = 25;
//Current cluster being searched
var questionsCluster;
//String used to modify and specify search
var search;

$(document).ready(function() {

  loadQuestionsCluster = $("#load-questions-cluster");
  searchInput = $("#search-input");
  questionAreaNotAdded = $("#question-area-not-added");
  questionAreaAdded = $("#question-area-added");

  questionsCluster = loadQuestionsCluster.val();
  search = searchInput.val();

  //Initialise questions
  var questionList = loadQuestions(questionsCluster, search, questionsLoaded, function(questionList) {
    addQuestionsNotAdded(questionList);
  });


  $(document).on('click', "#load-more", function() {
    questionList = loadQuestions(questionsCluster, search, questionsLoaded, function(questionList) {
      addQuestionsNotAdded(questionList);
    });
  });

  searchInput.on('keyup', function() {
    search = searchInput.val();
    //Set to zero to reset num questions
    questionsLoaded = 0;
    loadedQuestions = [];
    loadedIndices = [];
    searchIndicies = [];
    questionList = loadQuestions(questionsCluster, search, questionsLoaded, function(questionList) {
      replaceQuestionsNotAdded(questionList);
    });
  });

  loadQuestionsCluster.on('change', function() {
    questionsCluster = loadQuestionsCluster.val();
    //Set to zero to reset num questions
    questionsLoaded = 0;
    loadedQuestions = [];
    loadedIndices = [];
    searchIndicies = [];
    questionList = loadQuestions(questionsCluster, search, questionsLoaded, function(questionList) {
      replaceQuestionsNotAdded(questionList);
    });
  });


  //When add to exam button pressed
  $(document).on('click', '.add-question', function() {
    var id = getNum(this.id);
    var index = indexInArrayObject(loadedQuestions, "questionid", id);
    addToExam(loadedQuestions[index], id);
  });

  //When add to exam button pressed
  $(document).on('click', '.remove-question', function() {
    var id = getNum(this.id);
    var index = indexInArrayObject(inExam, "questionid", id);
    removeFromExam(inExam[index], id);
  });

  //When exam cluster dropdown changed
  $(document).on('change', '#exam-cluster-dropdown', function() {
    examCluster = this.value;
  });

  $(document).on('change', '#exam-locked-dropdown', function() {
    examUnlocked = this.value == 1;
  });

  $(document).on('change', '#exam-score-dropdown', function() {
    examShowScore = this.value == 1;
  });

  $("#exam-name-input").on('keyup', function() {
    examName = $("#exam-name-input").val();
  });

  $("#start-another-exam-btn").on('click', function(e) {
    e.preventDefault();
    if (confirm("Are you sure? You will lose unsubmitted progress on this current exam.")) {
      location.reload();
    }
  });

  $("#submit-exam-btn").on('click', function(e) {
    e.preventDefault();
    validateExam(function(err) {
      if (!err) {
        submitExam(function(err) {
          if (!err) {
            notify("Exam successfully created - you may leave this page", "success", "check");
          }
          else {
            notify(err, "danger", "exclamation");
          }
        });
      }
      else {
        notify(err, "danger", "exclamation");
      }
    });
  });
});


function validateExam(callback) {
  if (typeof(examName) == "undefined" || examName == "") {
    callback("Exam must have a name");
    return;
  }
  if (examName.length < 3) {
    callback("Exam name must be at least 3 characters");
  }
  if (inExam.length == 0) {
    callback("Exam must have questions in it");
    return;
  }
  callback(null);
  return;
}

function submitExam(callback) {
  var examQuestions = [];
  for (var i = 0; i < inExam.length; i++) {
    examQuestions.push(inExam[i].questionid);
  }

  $.ajax({
    type: "POST",
    url: "ajax",
    data: {
      ajaxid: "createExam",
      examCluster: examCluster,
      examShowScore: examShowScore,
      examUnlocked: examUnlocked,
      examName: examName,
      examQuestions: JSON.stringify(examQuestions)
    }
  }).done(function(data) {
    if (!data.err) {
      callback(null);
    }
    else {
      callback(data.err);
    }
  });
}



function addToExam(question, indexInArray) {
  inExam.push(question);
  loadedQuestions.clean(question);
  reloadQuestionAreas();
}

function removeFromExam(question, indexInArray) {
  inExam.clean(question);
  //Check if should be added back into questionAreaNotAdded
  if (searchIndicies.includes(question.questionid)) {
    loadedQuestions.push(question);
  }
  reloadQuestionAreas();
}

function loadQuestions(cluster, search, offset, callback) {
  $.ajax({
    type: "GET",
    url: "ajax",
    data: {
      ajaxid: "getQuestionList",
      cluster: cluster,
      offset: offset,
      search: search,
      questionsPer: questionsPer
    }
  }).done(function(data) {
    questionsLoaded += data.length;

    var newQuestions = data;
    for (var i = 0; i < inExam.length; i++) {
      loadedIndices.push(inExam[i].questionid);
    }
    for (var i = 0; i < data.length; i++) {
      searchIndicies.push(data[i].questionid);
      if (indexInArrayObject(inExam, "questionid", newQuestions[i].questionid) != -1) {
        newQuestions.splice(i, 1);
        i--;
      }
      else {
        loadedIndices.push(newQuestions[i].questionid);
      }
    }
    loadedQuestions = loadedQuestions.concat(newQuestions);
    callback(data);
    return;
  });
}


function reloadQuestionAreas() {
  replaceQuestionsNotAdded(loadedQuestions);
  replaceQuestionsAdded(inExam);
}




//Add questions to add questions box
function addQuestionsNotAdded(questions) {
  //Remove current load more button
  if ($("#load-more")) {
    $("#load-more").remove();
  }

  var html = '';

  if (questions.length == 0) {
    html = '<h1 class="text small thin dark">no more results</h1>';
  }
  else {
    html += generateQuestionsHTML(questions, false);
    //Add more button
    html += '<button class="btn btn-lg btn-block active-color" id="load-more">Load more</button>';
  }
  questionAreaNotAdded.append(html);
}

//Replace questions in add question box
function replaceQuestionsNotAdded(questions) {
  questionsLoaded = questionsPer;
  var html = '';
  if (questions.length == 0) {
    html = '<h1 class="text small thin dark">0 results returned</h1>';
  }
  else {
    html += generateQuestionsHTML(questions, false);
    //Add more button
    html += '<button class="btn btn-lg btn-block active-color" id="load-more">Load more</button>';
  }
  questionAreaNotAdded.html(html);
}


//Add questions to add questions box
function addQuestionsAdded(questions) {
  var html = '';
  html += generateQuestionsHTML(questions, true);
  questionAreaAdded.append(html);
}

//Replace questions in add question box
function replaceQuestionsAdded(questions) {
  var html = '';
  html += generateQuestionsHTML(questions, true);
  questionAreaAdded.html(html);
}






//inExam determines if questions currently in exam (show remove button) or just loaded (show add button)
function generateQuestionsHTML(questions, inExam) {
  var html = '';
  var optionLetters = ['A', 'B', 'C', 'D'];
  for (var i = 0; i < questions.length; i++) {
    html += generateQuestionHTML(questions[i], inExam, i)
  }
  return html;
}





function generateQuestionHTML(question, inExam, number) {
  var html = '';
  var optionLetters = ['A', 'B', 'C', 'D'];
  html += '<div class="question" id="question-' + question.questionid + '">' +
  '<div class="row">' +
  '<div class="col-lg-10 col-xs-9">' +
  '<h1 class="text small thin dark">';
  if (inExam) {
    html += '<i><b>' + ((questionsLoaded - questionsPer) + number + 1) + '. </b></i>';
  }
  html += question.question + '</h1>' +
  '</div>' +
  '<div class="col-lg-2 col-xs-3">';
  if (inExam) {
    html += '<button class="btn btn-defult active-color remove-question" style="float:right;" id="remove-question-' + question.questionid + '">Remove</button>';
  }
  else {
    html += '<button class="btn btn-defult active-color add-question" style="float:right;" id="add-question-' + question.questionid + '">Add</button>';
  }
  html += '</div>' +
  '</div>' +
  '<br>';
  //Add options
  for (var j = 0; j < 4; j++) {
    html += '<div class="row">' +
    '<div class="col-lg-8 col-xs-10">' +
    '<label for="rb-' + number + '-' + optionLetters[j] + '">' +
    '<h1 class="text xsmall thin dark"><i><b>' + optionLetters[j] + '. </b></i>' + question['option' + optionLetters[j]] + '</h1>' +
    '</div>' +
    '</div>';
  }
  html += '<div class="row">' +
  '<div class="col-lg-8 col-xs-10"' +
  '<h1 class="text xsmall thin dark"><i>Answer: ' + question.answer + '</i></h1>' +
  '</div>' +
  '</div>' +
  '<hr>' +
  '</div>';
  return html;
}





//Returns integers in a string
function getNum(string) {
  var num = string.match(/\d+/)[0];
  return num;
}

//Returns index of objects containing a property with the given value
function indexInArrayObject(array, prop, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i][prop] == value) {
      return i;
    }
  }
  return -1;
}

Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};
