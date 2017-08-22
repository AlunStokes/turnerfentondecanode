$(document).ready(function() {

  /*Fix navbar spacing*/
  setContentMargin("#navbar", "#body-content");
  $(window).resize(function() {
    setContentMargin("#navbar", "#body-content");
  });
  function setContentMargin(topElement, bottomElement) {
    $(bottomElement).css('margin-top', $(topElement).height() + 'px');
  }


  /*Headroom*/
  var navbar = document.getElementById("navbar");
  var headroom = new Headroom(navbar);
  headroom.init();


  /*Menu color*/
  function hexToLum(hex) {
    var hex = hex.substring(1);  // strip #
    var rgb = parseInt(hex, 16);   // convert rrggbb to decimal
    var r = (rgb >> 16) & 0xff;  // extract red
    var g = (rgb >>  8) & 0xff;  // extract green
    var b = (rgb >>  0) & 0xff;  // extract blue

    return(0.2126 * r + 0.7152 * g + 0.0722 * b);
  }
  function componentFromStr(numStr, percent) {
    var num = Math.max(0, parseInt(numStr, 10));
    return percent ?
    Math.floor(255 * Math.min(100, num) / 100) : Math.min(255, num);
  }
  function rgbToHex(rgb) {
    var rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/;
    var result, r, g, b, hex = "";
    if ( (result = rgbRegex.exec(rgb)) ) {
      r = componentFromStr(result[1], result[2]);
      g = componentFromStr(result[3], result[4]);
      b = componentFromStr(result[5], result[6]);

      hex = "#" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    return hex;
  }
  var backgroundColor = rgbToHex($("html").css("background-color"));
  var lum = hexToLum(backgroundColor);
  var color;
  if (lum < 180) {
    color = "#FFF";
  }
  else {
    color = "#343434";
  }
  //Change active link colours
  $(".navbar-link.active").css({"background-color": backgroundColor, "color": color});
  //Change inactive link hover colours
  $("<style>a:hover:not(.active) { background-color: " + backgroundColor + " !important; color: " + color + " !important; }</style>").appendTo("head");



  //TFD Extensions
  var ext = $("#tfd-extension");
  //index in array
  var i = 0;
  var timesPressed = 0;
  var tags = [
    "turner fenton deca"
  ];
  ext.html(tags[i]);
  $.ajax({
    type: "GET",
    url: "ajax",
    data: {
      ajaxid: "getTFDExtensions"
    }
  }).done(function(data) {
    if (data.err) {
      return;
    }
    tags = tags.concat(data.extensions);
  });
  ext.on('click', function() {
    i++;
    timesPressed++;
    if (timesPressed > 10) {
      //Check if logged in - logout only present when logged in
      if (document.getElementById("logout")) {
        $.ajax({
          type: "GET",
          url: "ajax",
          data: {
            ajaxid: "checkAllowedSubmitExtensions"
          }
        }).done(function(data) {
          //If hasn't been found
          if (!data.canSubmitExtensions) {
            window.location = "submit-extension";
          }
        });
      }
      else {
        alert("Maybe log in, and try again.")
      }
    }
    if (i >= tags.length) {
      i = 0;
    }
    ext.html(tags[i]);
  });
});
