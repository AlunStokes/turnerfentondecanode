$(document).ready(function() {

  var givenStudentNumber = findGetParameter("studentNumber");

  $.ajax({
      type: "GET",
      url: "ajax",
      data: {
        ajaxid: "getExamResultsLine",
        studentNumber: givenStudentNumber
      },
    }).done(function(data){
      if (data.err) {
        notify(data.err, "danger", "exclamation");
        $("#exam-results-line-card").css("display", "none");
        return;
      }

      var examResults = data.examResults;
      var months = [];
      var averages = [];

      for (var prop in examResults) {
        months.push(prop);
        averages.push(examResults[prop]);
      }

        var examResultsLineChartCanvas = $("#exam-results-line-chart");
        var examResultsLineInfo = {
          labels: months,
          datasets: [
          {
            label: "Exam Scores",
            fill: true,
            lineTension: 0.1,
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: "rgba(75,192,192,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 3,
            pointHitRadius: 10,
            data: averages,
            spanGaps: false,
          }
          ]
        };
        var examResultsLineOptions = {
          scales: {
            yAxes: [{
              display: true,
              ticks: {
                suggestedMin: 0,    // minimum will be 0, unless there is a lower value.
                // OR //
                beginAtZero: true,
                max: 100
              }
            }]
          }
        };
        var examResultsLineChart = new Chart(examResultsLineChartCanvas, {
          type: 'line',
          data: examResultsLineInfo,
          options: examResultsLineOptions
        });
    });
});
