var Utilities = require('../models/utilities');

var min = 1
var max = 10000;

for (var i = min; i <= max; i++) {
  Utilities.linCongGenGen(i, function(mod, increment, seed, multiplier) {
    console.log(i);
  });
}
