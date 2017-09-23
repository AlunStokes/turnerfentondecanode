var Utilities = require('../models/utilities');

var min = 1
var max = 10000

for (var i = min; i <= max; i++) {
  Utilities.linCongGenGen(i, function(mod, increment, seed, multiplier) {
/*
      console.log(mod);
      console.log(increment);
      console.log(seed);
      console.log(multiplier);
      console.log('-------');
      */
      if (typeof(increment) == 'undefined' || typeof(seed) == 'undefined' || typeof(multiplier) == 'undefined') {
        console.log("ERROR @ " + i);
      }

    if (i % 1000 == 0) {
      console.log(i);
    }
  });
}
