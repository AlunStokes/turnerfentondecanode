var Exam = require("../models/exam");

Exam.loadExam(1, function(err, exam) {
  if (err) {
    console.log(err);
    return;
  }
  console.log(exam);
})
