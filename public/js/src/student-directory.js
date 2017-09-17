$(document).ready(function() {
  $(function () {
    $('#directory-table').dataTable({
      lengthChange: true,
      ordering: true,
      paging: false,
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
          title: 'student-directory'
        }
      ],
      dom: 'Bfrtip'
    });
  });
});
