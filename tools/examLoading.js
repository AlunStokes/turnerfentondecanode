var Exam = require('../models/exam');

Exam.loadRandomExam("marketing", 100, function(mod, increment, seed, multiplier, offset, exam) {

  console.log("mod is " + mod);
  console.log("increment is " + increment);
  console.log("seed is " + seed);
  console.log("multiplier is " + multiplier);
  console.log("offset is " + offset);
  console.log(exam);
});
