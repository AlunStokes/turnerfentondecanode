/*!

=========================================================
* Paper Dashboard - v1.1.2
=========================================================

* Product Page: http://www.creative-tim.com/product/paper-dashboard
* Copyright 2017 Creative Tim (http://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/paper-dashboard/blob/master/LICENSE.md)

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/


var fixedTop = false;
var transparent = true;
var navbar_initialized = false;

var pd = {
  misc:{
    navbar_menu_visible: 0
  },
  checkScrollForTransparentNavbar: debounce(function() {
    if($(document).scrollTop() > 381 ) {
      if(transparent) {
        transparent = false;
        $('.navbar-color-on-scroll').removeClass('navbar-transparent');
        $('.navbar-title').removeClass('hidden');
      }
    } else {
      if( !transparent ) {
        transparent = true;
        $('.navbar-color-on-scroll').addClass('navbar-transparent');
        $('.navbar-title').addClass('hidden');
      }
    }
  }),
  initRightMenu: function(){
    if(!navbar_initialized){
      var $off_canvas_sidebar = $('nav').find('.navbar-collapse').first().clone(true);

      var $sidebar = $('.sidebar');
      var sidebar_bg_color = $sidebar.data('background-color');
      var sidebar_active_color = $sidebar.data('active-color');

      var $logo = $sidebar.find('.logo').first();
      var logo_content = $logo[0].outerHTML;

      var ul_content = '';

      // set the bg color and active color from the default sidebar to the off canvas sidebar;
      //This is redundant due to changing the colours by adding in CSS rules, but may break if taken out
      $off_canvas_sidebar.attr('data-background-color',sidebar_bg_color);
      $off_canvas_sidebar.attr('data-active-color',sidebar_active_color);

      $off_canvas_sidebar.addClass('off-canvas-sidebar');

      //add the content from the regular header to the right menu
      $off_canvas_sidebar.children('ul').each(function(){
        var content_buff = $(this).html();
        ul_content = ul_content + content_buff;
      });

      // add the content from the sidebar to the right menu
      var content_buff = $sidebar.find('.nav').html();
      ul_content = ul_content + '<li class="divider"></li>'+ content_buff;

      ul_content = '<ul class="nav navbar-nav">' + ul_content + '</ul>';

      var navbar_content = logo_content + ul_content;
      //Set background colour to match desktop sidebar
      var navbar_color = rgb2hex($(".sidebar-wrapper").css("background-color"));
      navbar_content = '<div class="sidebar-wrapper" style="background-color:#'+navbar_color+'">' + navbar_content + '</div>';

      $off_canvas_sidebar.html(navbar_content);

      $('body').append($off_canvas_sidebar);

      var $toggle = $('.navbar-toggle');

      $off_canvas_sidebar.find('a').removeClass('btn btn-round btn-default');
      $off_canvas_sidebar.find('button').removeClass('btn-round btn-fill btn-info btn-primary btn-success btn-danger btn-warning btn-neutral');
      $off_canvas_sidebar.find('button').addClass('btn-simple btn-block');

      $toggle.click(function (){
        if(pd.misc.navbar_menu_visible == 1) {
          $('html').removeClass('nav-open');
          pd.misc.navbar_menu_visible = 0;
          $('#bodyClick').remove();
          setTimeout(function(){
            $toggle.removeClass('toggled');
          }, 400);

        } else {
          setTimeout(function(){
            $toggle.addClass('toggled');
          }, 430);

          var div = '<div id="bodyClick"></div>';
          $(div).appendTo("body").click(function() {
            $('html').removeClass('nav-open');
            pd.misc.navbar_menu_visible = 0;
            $('#bodyClick').remove();
            setTimeout(function(){
              $toggle.removeClass('toggled');
            }, 400);
          });

          $('html').addClass('nav-open');
          pd.misc.navbar_menu_visible = 1;

        }
      });
      navbar_initialized = true;
    }

  }
}


$(document).ready(function(){
  var window_width = $(window).width();

  // Init navigation toggle for small screens
  if(window_width <= 991){
    pd.initRightMenu();
  }

  //  Activate the tooltips
  $('[rel="tooltip"]').tooltip();

});

// activate collapse right menu when the windows is resized
$(window).resize(function(){
  if($(window).width() <= 991){
    pd.initRightMenu();
  }
});


// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    if (immediate && !timeout) func.apply(context, args);
  };
};


//Function to convert rgb color to hex format
function rgb2hex(rgb) {
  //If rgba instead of rgb
  if (rgb.charAt(3) == "a") {
    return "FFFFFF";
  }
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function hex(x) {
  var hexDigits = new Array
  ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");
  return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}

//Allows post redirects
function post(path, parameters) {
  var form = $('<form></form>');

  form.attr("method", "post");
  form.attr("action", path);

  $.each(parameters, function(key, value) {
    if ( typeof value == 'object' || typeof value == 'array' ){
      $.each(value, function(subkey, subvalue) {
        var field = $('<input />');
        field.attr("type", "hidden");
        field.attr("name", key+'[]');
        field.attr("value", subvalue);
        form.append(field);
      });
    } else {
      var field = $('<input />');
      field.attr("type", "hidden");
      field.attr("name", key);
      field.attr("value", value);
      form.append(field);
    }
  });
  $(document.body).append(form);
  form.submit();
}


function notify(message, color, icon) {
  $.notify({
    icon: 'fa fa-' + icon,
    message: message
  },
  {
    type: color,
    timer: 5000,
    placement: {
      from: "bottom",
      align: "right"
    }
  });
}

Array.prototype.setAll = function(v) {
  var i, n = this.length;
  for (i = 0; i < n; ++i) {
    this[i] = v;
  }
}
