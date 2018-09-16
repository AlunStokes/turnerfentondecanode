$(document).ready(function() {

  initialiseTable();

  examidInput = $("#exam-id-input");

  examidInput.on('change', function() {
    change();
  });

  $(document).on('change', '.slider', function() {
    change();
  });
});

function initialiseTable() {
  //Initialise results chart
  $(function () {
    $('#exam-results-table').dataTable({
      lengthChange: true,
      ordering: true,
      paging: true,
      info: true,
      colReorder: true,
      autoWidth: true,
      responsive: true,
      iDisplayLength: 100,
      lengthMenu: [ [50, 100, -1], [50, 100, "All"] ],
      buttons: [
        'copyHtml5',
        'excelHtml5',
        {
          extend: 'csvHtml5',
          title: 'exam-results-' + Date.now()
        }
      ],
      dom: 'Bfrtip'
    });
  });
}

function generateGetArray(varName) {
  var checked = $(".slider:checked");
  var prop = [];
  for (var i = 0; i < checked.length; i++) {
    prop.push(checked[i].id.slice(7, checked[i].id.length));
  }
  var getArray = "?";
  for (var i = 0; i < prop.length; i++) {
    if (i == prop.length - 1) {
      getArray += varName + "[]=" + prop[i];
      break;
    }
    getArray += varName + "[]=" + prop[i] + "&";
  }
  return getArray;
}

function change() {
  var query = "";
  query += generateGetArray("fields");
  query += "&examid=" + examidInput.val();
  window.location.replace(query);
}
