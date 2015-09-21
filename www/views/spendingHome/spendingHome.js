angular.module('App')
.controller('spendingHomeController', ['$scope', '$q', 'TransactionService', 'CategoryService','chartColors', function ($scope, $q, TransactionSvc, CategorySvc, chartColors) {
    $scope.orderedCategories = [];
    $scope.selectedMonthYear = getSelectedMonthYear();
    $scope.selectedAccount = 'All Accounts';

    $scope.SAWChartConfig = {
        options: {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie',
                margin: [0, 0, 0, 0],
                spacingTop: 0,
                spacingBottom: 0,
                spacingLeft: 0,
                spacingRight: 0,
                height: 140
            },
            plotOptions: {
                pie: {
                    dataLabels: {
                        enabled: false
                    },
                    size: '100%'
                },
                series: {
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                }
            },
            title:{
                text: null
            },
            tooltip: {
              enabled: false
          }
        },
        series: [{
            /*data: [
              {categoryId: 23, color: '#3366CC', name: 'Travel', y: 500},
              {categoryId: 18, color: '#DC3912', name: 'Mortgages', y: 300},
              {categoryId: 37, color: '#FF9900', name: 'Taxes', y: 20}
            ],*/
            data: []
        }]
    };

    $q.all([
        TransactionSvc.get(),
        CategorySvc.get()
    ]).then(function() {
        var spendingCategories = TransactionSvc.getTopCategories();
        var newChartData = getformattedCategoriesData(spendingCategories);
        $scope.orderedCategories = newChartData;
        //redraw the chart by updating series data
        $scope.SAWChartConfig.series = [{data: newChartData}];
        console.table(newChartData);
    });

    function getSelectedMonthYear() {
        var currentTime = new Date();
        var currentMonth = currentTime.getMonth() + 1;
        var currentYear = currentTime.getFullYear();
        var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return monthNames[currentMonth] + ' ' + currentYear;
    }

    function getformattedCategoriesData(categories) {
        var newChartData = [];
        angular.forEach(categories, function(category, index){
            var newObj = {
                categoryId: category.categoryId, 
                color: chartColors.getColorbyIndex(index),
                name: CategorySvc.getCateNameById(category.categoryId), 
                y: category.netSpending
            };
            newChartData.push(newObj);
        });
        return newChartData;
    }

}]);