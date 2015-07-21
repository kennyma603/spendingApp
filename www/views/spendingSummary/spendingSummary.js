angular.module('App')
.controller('spendingSummaryController', function ($scope) {

  $scope.SAWChartConfig = {
        options: {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie',
                marginTop: 0,
                height: 170
            },
            plotOptions: {
                pie: {
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    }
                }
            },
            title:{
                text:null
            },
        },
        series: [{
            data: [
              {categoryId: 23, color: "#3366CC", name: "Travel", y: 500},
              {categoryId: 18, color: "#DC3912", name: "Mortgages", y: 300},
              {categoryId: 37, color: "#FF9900", name: "Taxes", y: 20}
            ]
        }]
    }
});