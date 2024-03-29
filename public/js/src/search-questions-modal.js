var loadQuestionsCluster;
var questionsSearchInput;
var questionAreaNotAdded;


//Holds questions that are currently loaded through the search AND not in the exam
var loadedQuestions = [];
//Number of questions currently loaded
var questionsLoaded = 0;
//Number of questions to be fetched per search
var questionsPer = 25;
//Current cluster being searched
var questionsCluster;
//String used to modify and specify search
var questionsSearch;

$(document).ready(function() {

  loadQuestionsCluster = $("#load-questions-cluster");
  questionsSearchInput = $("#questions-search-input");
  questionAreaNotAdded = $("#question-area");

  questionsCluster = loadQuestionsCluster.val();
 questionsSearch= questionsSearchInput.val();

  //Initialise questions
  var questionList = loadQuestions(questionsCluster, questionsSearch, questionsLoaded, function(questionList) {
    addQuestionsNotAdded(questionList);
  });


  $(document).on('click', "#load-more-questions", function() {
    questionList = loadQuestions(questionsCluster, questionsSearch, questionsLoaded, function(questionList) {
      addQuestionsNotAdded(questionList);
    });
  });

  questionsSearchInput.on('keyup', function() {
   questionsSearch= questionsSearchInput.val();
    //Set to zero to reset num questions
    questionsLoaded = 0;
    loadedQuestions = [];
    questionList = loadQuestions(questionsCluster, questionsSearch, questionsLoaded, function(questionList) {
      replaceQuestionsNotAdded(questionList);
    });
  });

  loadQuestionsCluster.on('change', function() {
    questionsCluster = loadQuestionsCluster.val();
    //Set to zero to reset num questions
    questionsLoaded = 0;
    loadedQuestions = [];
    questionList = loadQuestions(questionsCluster, questionsSearch, questionsLoaded, function(questionList) {
      replaceQuestionsNotAdded(questionList);
    });
  });
});

function loadQuestions(cluster, questionsSearch, offset, callback) {
  $.ajax({
    type: "GET",
    url: "ajax",
    data: {
      ajaxid: "getQuestionList",
      cluster: cluster,
      offset: offset,
      search: questionsSearch,
      questionsPer: questionsPer
    }
  }).done(function(data) {
    questionsLoaded += data.length;
    loadedQuestions = loadedQuestions.concat(data);
    callback(data);
    return;
  });
}

//Add questions to add questions box
function addQuestionsNotAdded(questions) {
  //Remove current load more button
  if ($("#load-more-questions")) {
    $("#load-more-questions").remove();
  }

  var html = '';

  if (questions.length == 0) {
    html = '<h1 class="text small thin dark">no more results</h1>';
  }
  else {
    html += generateQuestionsHTML(questions);
    //Add more button
    html += '<button class="btn btn-lg btn-block active-color" id="load-more-questions">Load more</button>';
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
    html += generateQuestionsHTML(questions);
    //Add more button
    html += '<button class="btn btn-lg btn-block active-color" id="load-more-questions">Load more</button>';
  }
  questionAreaNotAdded.html(html);
}

//inExam determines if questions currently in exam (show remove button) or just loaded (show add button)
function generateQuestionsHTML(questions) {
  var html = '';
  var optionLetters = ['A', 'B', 'C', 'D'];
  for (var i = 0; i < questions.length; i++) {
    html += generateQuestionHTML(questions[i], i)
  }
  return html;
}

function generateQuestionHTML(question, number) {
  var html = '';
  var optionLetters = ['A', 'B', 'C', 'D'];
  html += '<div class="question" id="question-' + question.questionid + '">' +
  '<div class="row">' +
  '<div class="col-lg-10 col-xs-9">' +
  '<h1 class="text small thin dark">';
    html += '<i><b>' + ((questionsLoaded - questionsPer) + number + 1) + '. </b></i>';
  html += question.question + '</h1>' +
  '</div>' +
  '<div class="col-lg-2 col-xs-3">';
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
