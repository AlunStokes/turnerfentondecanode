$(document).ready(function() {

  //Load cluster proficiency pie chart
  $.ajax({
    type: "GET",
    url: "ajax",
    data: {
      ajaxid : "getClusterProficiency"
    },
  }).done(function(data){
    if (data.err) {
      notify(data.err, "danger", "exclamation");
      $("#cluster-proficiency-card").css("display", "none");
      return;
    }
    var clusterProficiency = data.clusterProficiency;

    var clusterProficiencyChartCanvas = $("#cluster-proficiency-chart");
    var clusterProficiencyInfo = {
      labels: [
        "Marketing",
        "Finance",
        "Business Administration",
        "Hospitality & Tourism"
      ],
      datasets: [
        {
          data: [clusterProficiency.marketing, clusterProficiency.finance, clusterProficiency.businessadmin, clusterProficiency.hospitality],
          backgroundColor: [
            "#222D32",
            "#255C99",
            "#EE4266",
            "#3C8DBC"
          ],
          hoverBackgroundColor: [
            "#222D32",
            "#255C99",
            "#EE4266",
            "#3C8DBC"
          ]
        }]
      };
      var clusterProficiencyChart = new Chart(clusterProficiencyChartCanvas, {
        type: 'doughnut',
        data: clusterProficiencyInfo,
        animation:{
          animateScale:true
        }
      });
    });

});
