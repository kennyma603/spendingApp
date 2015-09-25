angular.module('App')
.controller('spendingHomeController', ['$scope', '$q', 'TransactionService', 'CategoryService','chartColors', function ($scope, $q, TransactionSvc, CategorySvc, chartColors) {


}])

.controller('spendingSubheadingCtrl', ['$scope', function ($scope) {
    $scope.selectedMonthYear = getSelectedMonthYear();
    $scope.selectedAccount = 'All Accounts';

    function getSelectedMonthYear() {
        var currentTime = new Date();
        var currentMonth = currentTime.getMonth() + 1;
        var currentYear = currentTime.getFullYear();
        var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return monthNames[currentMonth] + ' ' + currentYear;
    }
}])

.controller('spendingPieChartCtrl', ['$scope', '$q', 'TransactionService', 'CategoryService','chartColors', function ($scope, $q, TransactionSvc, CategorySvc, chartColors) {
    if(typeof $scope.height === 'undefined') {
        $scope.height = 140;
    }
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
                height: $scope.height
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
            data: []
        }]
    };

    $q.all([
        TransactionSvc.get(),
        CategorySvc.get()
    ]).then(function() {
        var spendingCategories = TransactionSvc.getTopCategories();
        var newChartData = getformattedCategoriesData(spendingCategories);
        //redraw the chart by updating series data
        $scope.SAWChartConfig.series = [{data: newChartData}];
        //console.table(newChartData);
    });

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
}])

.controller('spendingCategoryListCtrl', ['$scope', '$q', 'TransactionService', 'CategoryService','chartColors', function ($scope, $q, TransactionSvc, CategorySvc, chartColors) {
    var isOnClickLoadTransactionEnabled = ($scope.onClickLoadTransaction === 'enable') ? true : false;
    $scope.currentViewingCategoryId = null;
    $scope.orderedCategories = [];
    console.log($scope, isOnClickLoadTransactionEnabled);

    if(typeof $scope.numberofCate === 'undefined') {
        $scope.numberofCate = 'Infinity';
    }

    $q.all([
        TransactionSvc.get(),
        CategorySvc.get()
    ]).then(function() {
        var spendingCategories = TransactionSvc.getTopCategories();
        var newChartData = getformattedCategoriesData(spendingCategories);
        $scope.orderedCategories = newChartData;
    });

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

    $scope.loadTransaction = function(categoryId){
        if(isOnClickLoadTransactionEnabled) {
            $scope.currentViewingCategoryId = categoryId;
            console.log(categoryId);
        }
    }
}])

angular.module('App')
.controller('spendingSummaryController', ['$scope', '$q', 'TransactionService', 'CategoryService', function ($scope, $q, TransactionSvc, CategorySvc) {
    $q.all([
        TransactionSvc.get(),
        CategorySvc.get()
    ]).then(function() {
        $scope.totalNetSpending = TransactionSvc.getTotalNetSpending();
    });

}])
;