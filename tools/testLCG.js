var Utilities = require('../models/utilities');

var array = [];
var timesRun = 1;
console.time("A");
for (var i = 0; i < timesRun; i++) {
  Utilities.linCongGenGen(90, function(mod, increment, seed, multiplier) {
    array.push(mod + ":" + increment + ":" + seed + ":" + multiplier);
    console.log("mod:" + mod + " - " + "increment:" + increment + " - " + "seed:" + seed + " - " + "multiplier:" + multiplier);
    return;
  });
}
console.timeEnd("A");

/*
for (var i = 0; i < array.length; i++) {
  for (var j = 0; j < array.length; j++) {
    if (array[i] == array[j] && i != j) {
      dup++;
      console.log("duplicate:    " + array[j]);
    }
  }
}
*/
