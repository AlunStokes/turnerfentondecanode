$(document).ready(function() {
  $('#typed-text').typeIt({
    strings: ["i am", "we are", "this is"],
    html: true,
    breakLines: false,
    deleteDelay: 2500,
    startDelay: 100,
    loopDelay: 2500,
    loop: true
  });
});
