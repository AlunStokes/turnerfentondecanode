

var utilities = {
  //takes url and array of navbar entries as inputs, returns the index of array occupied by url, else -1
  getActivePage: function(url, navbarArray, callback) {
    this.removeUrlParameters(url.split('/')[1], function(page) {
      for (var i = 0; i < navbarArray.length; i++) {
        for (var j = 0; j < navbarArray[i].alias.length; j++) {
          if (navbarArray[i].alias[j] == page) {
            callback(i);
            return;
          }
        }
      }
      callback(-1);
    });
  },
  generateRandomString: function(numChars, callback) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < numChars; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));
    callback(text);
  },
  removeUrlParameters: function(url, callback) {
    var index = 0;
    var newUrl = url;
    var index = url.indexOf('?');
    if(index == -1){
      index = url.indexOf('#');
    }
    if(index != -1){
      newUrl = url.substring(0, index);
    }
    callback(newUrl);
  },
  isUrl: function(string) {
    var pattern = new RegExp('^(https?:\/\/)?'+ // protocol
    '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|'+ // domain name
    '((\d{1,3}\.){3}\d{1,3}))'+ // OR ip (v4) address
    '(\:\d+)?(\/[-a-z\d%_.~+]*)*'+ // port and path
    '(\?[;&a-z\d%_.~+=-]*)?'+ // query string
    '(\#[-a-z\d_]*)?$','i'); // fragment locater
    if(!pattern.test(str)) {
      return false;
    } else {
      return true;
    }
  },
  //Linear congruential generator generator - given an input of the size of the set, it will generate the parameters that define the generator
  linCongGenGen: function(setSize, callback) {
    var mod = setSize;
    var increment;
    var seed = parseInt(Math.random() * (mod - 2) + 1);
    var multiplier;
    utilities.getCoprimeTo(mod, mod-1, function(coprime) {
      increment = coprime;
      utilities.getPrimeFactorsOf(mod, function(modFactors) {
        utilities.getModularlyCongruentToSet(1, modFactors, 1, mod-1, mod % 4 == 0, function(b) {
          multiplier = b;
          callback(mod, increment, seed, multiplier);
          return;
        })
      });
    })
  },
  //The empty list upon which LinConGen acts
  linConGenList: [

  ],
  //A counter for use with ofsetting when running linConGen
  //Must start at -1 to offset zero index
  linConGenTermsCalculated: 0,
  //Linear congruential generator - takes parameters to define generators and number of terms, offset into the generator by offset number of terms, and returns an array of the integer values for the generator
  linConGen: function(mod, increment, seed, multiplier, terms, offset, callback) {
    var term;
    if (utilities.linConGenTermsCalculated == 0) {
      term = seed;
      if (offset == 0) {
        utilities.linConGenList.push(seed);
      }
      utilities.linConGenTermsCalculated++;
    }
    else {
      term = (multiplier * seed + increment) % mod;
      utilities.linConGenTermsCalculated++;
      if (utilities.linConGenTermsCalculated > offset) {
        utilities.linConGenList.push(term);
      }
    }
    if (utilities.linConGenList.length < terms) {
      utilities.linConGen(mod, increment, term, multiplier, terms, offset, callback);
      return;
    }
    else {
      callback(utilities.linConGenList);
      //Empties list when finished
      utilities.linConGenList = [];
      utilities.linConGenTermsCalculated = 0;
      return;
    }
  },
  //Returns an arrays containing all non-one factors of input (does count itself)
  getFactorizationOf: function(a, callback) {
    var half = Math.floor(a / 2), // Ensures a whole number <= num.
    factors = [];
    i = 0;
    j = 0;
    // Determine increment value for the loop and starting point.
    a % 2 === 0 ? (i = 2, j = 1) : (i = 3, j = 2);
    for (i; i <= half; i += j) {
      a % i === 0 ? factors.push(i) : false;
    }
    factors.push(a);
    callback(factors);
    return;
  },
  //Returns an array of the prime factors of a (does not repeat factors or list exponents)
  getPrimeFactorsOf: function(a, callback) {
    if (a == 0 || a == 1) {
      callback([]);
      return;
    }
    var primes = [];
    utilities.getFactorizationOf(a, function(factors) {
      for (var i = 0; i < factors.length; i++) {
        utilities.isPrime(factors[i], function(primality) {
          if (primality) {
            primes.push(factors[i]);
          }
        });
      }
      callback(primes);
      return;
    });
  },
  getPrimeFactorsOfUpTo: function(max, callback) {
    var pFactors = [];
    for (var i = 0; i < max; i++) {
      utilities.getPrimeFactorsOf(i, function(factors) {
        pFactors[i] = factors;
      });
    }
    callback(pFactors);
    return;
  },
  //Returns a coprime integer to the given input between the max and min values given
  getCoprimeTo(a, max, callback) {
    var viable = [];
    utilities.getPrimeFactorsOf(a, function(pFactorsA) {
      utilities.getPrimeFactorsOfUpTo(max, function(pFactors) {
        //Remove 0 and 1 from array -> no prime factors
        pFactors.splice(0,2);
        for (var i = 0; i < pFactors.length; i++) {
          if (!pFactorsA.compare(pFactors[i])) {
            //+2 to account for removing 0 and 1
            viable.push(i + 2);
          }
        }
        var index = parseInt(Math.random() * (viable.length), 10);
        callback(viable[index]);
        return;
      });
    });
  },
  //Checks if a and b are congruent modulo n; returns true if so, false if not
  checkModularCongruence(a, b, n, callback) {
    if ((a - b) % n == 0) {
      //console.log(a + " is congruent to " + b + " mod " + n);
      callback(true);
      return;
    }
    //console.log(a + " is not congruent to " + b + " mod " + n);
    callback(false);
    return;
  },
  //Returns a value a between min and max for which and a and b are congruent modulo the entire set of n, where n is an integer array
  //divByFour is a boolean which represents whether a must be divisible by 4
  getModularlyCongruentToSet(b, n, min, max, divByFour, callback) {
    var aPass = true;
    if (divByFour) {
      var possibleNums = utilities.getNumbersUpToDivisibleBy(max, 4);
      //Add b to each possibleNum to offset its subtraction
      for (var i = 0; i < possibleNums.length; i++) {
        possibleNums[i] += 1;
      }
      //Add first index to last to make it more likely to get the previous last index
      possibleNums.push(possibleNums[0]);
      a = possibleNums[parseInt(Math.random() * (possibleNums.length - 1))];
    }
    else {
      //Get lowest common multiple of all numbers in n
      var lcm = utilities.lcm(n);
      var maxMultiplier = Math.floor(max/lcm);
      //+ 1 is to offset subtraction of 1
      var a = (parseInt(Math.random() * (500)) % (maxMultiplier + 1)) * lcm + 1;
    }
    for (var i = 0; i < n.length; i++) {
      utilities.checkModularCongruence(a, b, n[i], function(congruent) {
        if (!congruent) {
          //this a is non-valid
          aPass = false;
          //break out of for loop
          i = n.length;
          utilities.getModularlyCongruentToSet(b, n, min, max, divByFour, callback);
          return;
        }
      });
    }
    if (aPass) {
      //console.log(a + " is good")
      callback(a);
    }
    return;
  },
  //Returns true if coprime, false if not
  checkCoprimality: function(a, b, callback) {
    utilities.getFactorizationOf(a, function(factorsA) {
      utilities.getFactorizationOf(b, function(factorsB) {
        utilities.checkArrayCollision(factorsA, factorsB, function(collision) {
          callback(!collision);
          return;
        });
      });
    });
  },
  //Checks if arrays share any values; returns true if they do, false if not
  checkArrayCollision: function(arr1, arr2, callback) {
    if (arr1.length == 0 || arr2.length == 0) {
      callback(false);
      return;
    }
    callback(arr1.some(v => arr2.indexOf(v) >= 0));
    return;
  },
  getPrimesUpTo(upperBound, callback) {
    var primes = [];
    for (var i = 1; i < upperBound; i++) {
      utilities.isPrime(i, function(prime) {
        if (prime) {
          primes.push(i);
        }
      });
    }
    callback(primes);
    return;
  },
  //Returns primality of n
  isPrime(n, callback) {
    if (n < 2) {
      callback(false);
      return;
    }
    if (n === 2) {
      callback(true);
      return;
    }
    if (n === 3) {
      callback(true);
      return;
    }
    if (n % 2 === 0) {
      callback(false);
      return;
    }
    if (n % 3 === 0) {
      callback(false);
      return;
    }
    if (n % 1) {
      callback(false);
      return;
    }
    var sqrtOfN = Math.sqrt(n);
    for (var i = 5; i <= sqrtOfN; i += 6){
      if (n % i === 0) {
        callback(false);
        return;
      }
      if (n % (i + 2) === 0) {
        callback(false);
        return;
      }
    }
    callback(true);
    return;
  },
  //Returns an array of integers from 0 to max which are divisible by the divisor
  getNumbersUpToDivisibleBy: function(max, divisor) {
    var num = [];
    for (var i = 0; i <= max; i++) {
      if (i % divisor == 0) {
        num.push(i);
      }
    }
    return num;
  },
  //Returns array containing all colliding elements of two input arrays
  getArrayCollision: function (a, b, callback) {
    var result = [];
    while( a.length > 0 && b.length > 0 )
    {
      if (a[0] < b[0] ) {
        a.shift();
      }
      else if (a[0] > b[0] ) {
        b.shift();
      }
      else /* they're equal */
      {
        result.push(a.shift());
        b.shift();
      }
    }
    callback(result);
    return;
  },
  //Takes array of integers as input and returns lowest common multiple
  lcm: function(arr) {
    var len = arr.length;
    // Convert any negative integers to positive integers...
    for ( i = 0; i < len; i++ ) {
      a = arr[ i ];
      if ( a < 0 ) {
        arr[ i ] = -a;
      }
    }
    // Exploit the fact that the lcm is an associative function...
    a = arr[ 0 ];
    for ( i = 1; i < len; i++ ) {
      b = arr[ i ];
      if ( a === 0 || b === 0 ) {
        return 0;
      }
      a = ( a/utilities.gcd(a,b) ) * b;
    }
    return a;
  },
  gcd: function( a, b ) {
    var k = 1,
    t;
    // Simple cases:
    if ( a === 0 ) {
      return b;
    }
    if ( b === 0 ) {
      return a;
    }
    // Reduce `a` and/or `b` to odd numbers and keep track of the greatest power of 2 dividing both `a` and `b`...
    while ( a%2 === 0 && b%2 === 0 ) {
      a = a / 2; // right shift
      b = b / 2; // right shift
      k = k * 2; // left shift
    }
    // Reduce `a` to an odd number...
    while ( a%2 === 0 ) {
      a = a / 2; // right shift
    }
    // Henceforth, `a` is always odd...
    while ( b ) {
      // Remove all factors of 2 in `b`, as they are not common...
      while ( b%2 === 0 ) {
        b = b / 2; // right shift
      }
      // `a` and `b` are both odd. Swap values such that `b` is the larger of the two values, and then set `b` to the difference (which is even)...
      if ( a > b ) {
        t = b;
        b = a;
        a = t;
      }
      b = b - a; // b=0 iff b=a
    }
    // Restore common factors of 2...
    return k * a;
  }
}

Array.prototype.compare = function(arr) {
  return this.filter(function(item){ return arr.indexOf(item) > -1}) > 0;
}

module.exports = utilities;
