angular.module('App')
.controller('spendingHomeController', ['$scope', '$q', 'SpendingService', 'CategoryService','chartColors', function ($scope, $q, TransactionSvc, CategorySvc, chartColors) {


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

.controller('spendingPieChartCtrl', ['$scope', '$q', 'SpendingService', 'CategoryService','chartColors', function ($scope, $q, TransactionSvc, CategorySvc, chartColors) {
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
                    size: '100%',
                    borderWidth: 0
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
        $scope.categoryMapToId = mapCategoryToId(newChartData);
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
    function mapCategoryToId(categories) {
        var map = {};
        angular.forEach(categories, function(category, index) {
            map[category.categoryId] = index;
        });
        return map;
    }

    $scope.$on('talkToOne', function( event, data ){
        //when category clicked from transactionlist, the pie chart should react by selecting the corresponding pie
        var chart = $("#spending-summary #SAWChart");
        if(chart.length > 0) {
            var chartIndex = chart.data('highchartsChart');
            var categoryIndex = $scope.categoryMapToId[data.categoryId];
            Highcharts.charts[chartIndex].series[0].data[categoryIndex].select();
        }
    });


}])

.controller('spendingCategoryListCtrl', ['$scope', '$q', 'SpendingService', 'CategoryService','chartColors', function ($scope, $q, TransactionSvc, CategorySvc, chartColors) {
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
            
            $scope.$emit('pushChangesToAllNodes', { name: 'talkToOne', data: {categoryId: categoryId}});

            if($scope.currentViewingCategoryId === categoryId) {
                //if same category is clicked, we reset currentViewingCategoryId to null, so transaction list would collapse
                $scope.currentViewingCategoryId = null;
            } else{
                $scope.currentViewingCategoryId = categoryId;
            }
        }
    }
}])

.controller('spendingSummaryController', ['$scope', '$q', 'SpendingService', 'CategoryService', function ($scope, $q, TransactionSvc, CategorySvc) {
    $q.all([
        TransactionSvc.get(),
        CategorySvc.get()
    ]).then(function() {
        $scope.totalNetSpending = TransactionSvc.getTotalNetSpending();
    });

    $scope.$on('pushChangesToAllNodes', function( event, message ){
      $scope.$broadcast( message.name, message.data );
    });
}])

.controller('spendingSelectedCategoryTransListCtrl', ['$scope', '$q', 'TransactionService', function ($scope, $q, TransactionSvc) {
    $scope.transactionList = {};
    var requestParams = {categoryId: $scope.categoryId};

    $q.all([
        TransactionSvc.get({categoryId: $scope.categoryId})
    ]).then(function() {
        
        $scope.transactionList = TransactionSvc.getTransactionListGroupbyDate();
        console.log('out put data');
    });

}])
;