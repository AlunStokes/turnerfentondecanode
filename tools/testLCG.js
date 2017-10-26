var Utilities = require('../models/utilities');

var min = 5000
var max = 5000

for (var i = min; i <= max; i++) {
  Utilities.linCongGenGen(i, function(mod, increment, seed, multiplier) {
    Utilities.linConGen(mod, increment, seed, multiplier, mod, 0, function(numList) {
      if (hasDup(numList)) {
        console.log("Duplicate at " + i);
        console.log("mod: " + mod);
        console.log("incrememnt: " + increment);
        console.log("multiplier: " + multiplier);
        //console.log(i + " : " + numList);
      }
    });
  });
}

function hasDup(array) {
    return array.some(function(value) {                            // .some will break as soon as duplicate found (no need to itterate over all array)
       return array.indexOf(value) !== array.lastIndexOf(value);   // comparing first and last indexes of the same value
    })
}
