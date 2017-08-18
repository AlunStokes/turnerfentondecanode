var sessionidInput;

$(document).ready(function() {
  $(function () {
    $('#attendance-table').dataTable({
      lengthChange: true,
      ordering: true,
      paging: false,
      info: true,
      autoWidth: true,
      responsive: true,
      iDisplayLength: 100,
      lengthMenu: [ [50, 100, -1], [50, 100, "All"] ],
      buttons: [
        'copyHtml5',
        'excelHtml5',
        {
          extend: 'csvHtml5',
          title: 'tfdeca-attendance-' + $("#session-id-input :selected").text()
        }
      ],
      dom: 'Bfrtip'
    });
  });

  sessionidInput = $("#session-id-input");

  sessionidInput.on('change', function() {
    window.location = 'check-attendance?sessionid=' + sessionidInput.val();
  });
});
