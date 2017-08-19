//Updates background colour of sidebar from jscolor input
function changeSidebarBackground(jscolor) {
$(".sidebar-wrapper").css('background-color', '#'+jscolor);
}
//Updates text colour in sidebar from jscolor input
function changeSidebarText(jscolor) {
$(".sidebar-wrapper li:not(.active) a").css('color', '#'+jscolor);
$(".sidebar-wrapper .logo a").css('color', '#'+jscolor);
}
//Updates active colour in sidebar from jscolor input
function changeSidebarActive(jscolor) {
$(".active a").css('color', '#'+jscolor);
}
//Sends ajax requrest to save colour preferences into database
function saveColors() {
$.ajax ({
  type: "POST",
  url: "ajax",
  data: {
    ajaxid: "updateColorPreference",
    sidebarBackground: rgb2hex($(".sidebar-wrapper").css("background-color")),
    sidebarText: rgb2hex($(".sidebar-wrapper li:not(.active) a").css("color")),
    sidebarActive: rgb2hex($(".active a").css("color"))
  }
}).done (function(data) {
  if (data.err) {
    notify(data.err, "warning", "exclamation");
    return;
  }
  notify("Your colour preferences have been saved", "success", "floppy-o");
  return;
});
}
