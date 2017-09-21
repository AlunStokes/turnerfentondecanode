$(document).ready(function() {

  initialiseTable();

  examidInput = $("#exam-id-input");

  examidInput.on('change', function() {
    window.location = 'chapter-exam-statistics?examid=' + examidInput.val();
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
