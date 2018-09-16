$(document).ready(function() {

  //Initialise results chart
  $(function () {
    $('#exam-results-table').dataTable({
      lengthChange: true,
      ordering: true,
      order: [[0, 'desc']],
      true: false,
      info: true,
      colReorder: true,
      searching: false,
      autoWidth: true,
      responsive: true,
      iDisplayLength: 100,
      lengthMenu: [ [50, 100, -1], [50, 100, "All"] ],
      buttons: [
        'copyHtml5',
        'excelHtml5',
        {
          extend: 'csvHtml5',
          title: 'exam-results-' + studentNumber + '-' + $("#session-id-input :selected").text()
        }
      ],
      dom: 'B'
    });
  });
});
