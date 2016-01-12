angular.module('App')
.controller('spendingHomeController', ['$scope', '$state', 'localStorage', 'BudgetService', function ($scope, $state, localStorage) {
    $scope.sectionClicked = function(sectionName) {
        $state.go(sectionName);
    }
    localStorage.set('timeFrame', 'this-month');
    localStorage.set('accountId', '');
    localStorage.set('groupId', '');


}])

.controller('spendingSubheadingCtrl', ['$scope', 'localStorage', 'AccountService', 'GroupService', function ($scope, localStorage, AccountSvc, GroupSvc) {
    $scope.selectedMonthYear = getSelectedMonthYear();
    
    setSubheading();

    function getSelectedMonthYear() {
        var currentTime = new Date();
        var currentMonth = currentTime.getMonth();
        var currentYear = currentTime.getFullYear();
        var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return monthNames[currentMonth] + ' ' + currentYear;
    }

    function setSubheading() {
        var selectedAccount = 'All Accounts';
        if(localStorage.get('accountId')){  
            selectedAccount = AccountSvc.getAccountNameById(localStorage.get('accountId'));

        } else if(localStorage.get('groupId')){

            if(localStorage.get('groupId') !== 'all'){
                selectedAccount = GroupSvc.getGroupNameById(localStorage.get('groupId'));  
            }
        }
        $scope.selectedAccount = selectedAccount;
    }
}])

.controller('spendingPieChartCtrl', ['$scope', '$q', 'SpendingService', 'CategoryService', 'chartColors', 'timeFrameHelper', 'localStorage', function ($scope, $q, TransactionSvc, CategorySvc, chartColors, timeFrameHelper, localStorage) {
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

    var timeFrameObj = timeFrameHelper.getFromDateEndDate(localStorage.get('timeFrame'));
    var requestParams = {
        groupId: 'all',
        fromDate: timeFrameObj.fromDate,
        toDate: timeFrameObj.toDate
    };

    $q.all([
        TransactionSvc.get(requestParams),
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

.controller('spendingCategoryListCtrl', ['$scope', '$q', 'SpendingService', 'CategoryService', 'chartColors', 'timeFrameHelper', 'localStorage', function ($scope, $q, TransactionSvc, CategorySvc, chartColors, timeFrameHelper, localStorage) {
    var isOnClickLoadTransactionEnabled = ($scope.onClickLoadTransaction === 'enable') ? true : false;
    $scope.currentViewingCategoryId = null;
    $scope.orderedCategories = [];
    //console.log($scope, isOnClickLoadTransactionEnabled);

    if(typeof $scope.numberofCate === 'undefined') {
        $scope.numberofCate = 'Infinity';
    }

    var timeFrameObj = timeFrameHelper.getFromDateEndDate(localStorage.get('timeFrame'));
    var requestParams = {
        groupId: 'all',
        fromDate: timeFrameObj.fromDate,
        toDate: timeFrameObj.toDate
    };

    $q.all([
        TransactionSvc.get(requestParams),
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

.controller('spendingAccountsController', ['$scope', '$q', '$state', 'AccountService', 'GroupService', 'localStorage', function ($scope, $q, $state, AccountSvc, GroupSvc, localStorage) {
    
    $scope.creditUnionName = 'My Credit Union';

    AccountSvc.get().then(function(){
        $scope.financialAccounts = AccountSvc.getFinancialAccounts();
        $('#all-accounts').show();
        if($scope.financialAccounts.length === 0){
            $('#cu-name').hide();
        }
    }, function(reason){
        $('#account-list ul').hide();
        $('#accountSvc-error').show();
    });

    GroupSvc.get().then(function(){
        $scope.groups = GroupSvc.getGroupList();
        $('#all-accounts').show();
        if($scope.groups.length === 0){
            $('#groups-header').hide();
            $('#account-group-list').hide();
        }
    }, function(reason){
        $('#account-group-list ul').hide();
        $('#groupSvc-error').show();
    });

    $scope.selectionClicked = function(selectionType, id, name){
        if(selectionType === 'accountClicked') {
            localStorage.set('accountId', id);
            localStorage.set('groupId', '');
        } else if(selectionType === 'groupClicked') {
            localStorage.set('accountId', '');
            localStorage.set('groupId', id);

        } else if(selectionType === 'allAccountClicked') {
            localStorage.set('accountId', '');
            localStorage.set('groupId', 'all');
        }
        $state.go('spendingSummary');
    }
}])

.controller('spendingSummaryController', ['$scope', '$q', 'SpendingService', 'CategoryService', 'localStorage', 'timeFrameHelper', function ($scope, $q, TransactionSvc, CategorySvc, localStorage, timeFrameHelper) {
    $scope.selectedTimeFrameLabel = timeFrameHelper.getTimeFrameLabelbyKey(localStorage.get('timeFrame'));

    var timeFrameObj = timeFrameHelper.getFromDateEndDate(localStorage.get('timeFrame'));
    var fromDate = timeFrameHelper.getMonthYear(timeFrameObj.fromDate);
    var toDate = timeFrameHelper.getMonthYear(timeFrameObj.toDate);

    $scope.monthYearLabel = (fromDate === toDate) ? fromDate : fromDate + ' - ' + toDate;

    var requestParams = {
        groupId: 'all',
        fromDate: timeFrameObj.fromDate,
        toDate: timeFrameObj.toDate
    };

    $q.all([
        TransactionSvc.get(requestParams),
        CategorySvc.get()
    ]).then(function() {
        $scope.totalNetSpending = TransactionSvc.getTotalNetSpending();
    });

    $scope.$on('pushChangesToAllNodes', function( event, message ){
      $scope.$broadcast( message.name, message.data );
    });
}])

.controller('spendingSelectedCategoryTransListCtrl', ['$scope', '$q', '$ionicScrollDelegate', 'TransactionService', function ($scope, $q, $ionicScrollDelegate, TransactionSvc) {
    $scope.transactionList = {};
    var requestParams = {categoryId: $scope.categoryId};
    $ionicScrollDelegate.resize();
    $q.all([
        TransactionSvc.get({categoryId: $scope.categoryId})
    ]).then(function() {
        
        $scope.transactionList = TransactionSvc.getTransactionMapGroupbyDate({order: 'desc'});
    });
}])

.controller('changeMonthController', ['$scope', '$state', '$ionicViewSwitcher', 'localStorage', function ($scope, $state, $ionicViewSwitcher, localStorage) {
     var currentTimeFrame = (localStorage.get('timeFrame') !== undefined) ? localStorage.get('timeFrame') : 'this-month' ;
     $scope.timeFrame = { selectedTimeFrame: currentTimeFrame};
     
     $scope.getIconName = function (value) {
        //console.log('hi');
        return ($scope.timeFrame.selectedTimeFrame === value) ? 'ion-record' : 'ion-ios-circle-outline';
     };
     $scope.setTimeFrame = function() {
        console.log($scope.timeFrame.selectedTimeFrame);
        localStorage.set('timeFrame', $scope.timeFrame.selectedTimeFrame);
        $ionicViewSwitcher.nextDirection('back');
        $state.go('spendingSummary');
     }
}])

.controller('spendingBudgetItemCtrl', ['$scope', 'BudgetService', 'CategoryService', function ($scope, BudgetSvc, CategorySvc) {
    
    BudgetSvc.get().then(function(){
        $scope.budgetArray = [];

        if ($scope.showOverview === "true") {
            var overViewBudget = BudgetSvc.getCurrentMonthBudgetOverview();
            if((overViewBudget.hasBudgetData)) {
                $scope.budgetArray.push(overViewBudget);
            }
        }

        if ($scope.showCategory === "all") {
            var currentMonthBudget = BudgetSvc.getCurrentMonthBudget();
            if((currentMonthBudget.length > 0)) {
                CategorySvc.get().then(function() {
                    angular.forEach(currentMonthBudget, function(budget) {
                        budget.categoryName = CategorySvc.getCateNameById(budget.categoryId);
                    });
                });

                $scope.budgetArray = $scope.budgetArray.concat(currentMonthBudget);
            }
        }

        if($scope.budgetArray.length > 0) {
            $('#budget-summary-overview .widget-content').hide();
            $('#budget-summary-overview .widget-body-has-data').show();
        } else {
            $('#budget-summary-overview .widget-content').hide();
            $('#budget-summary-overview .widget-body-no-data').show();
        }

    }, function(reason){
        $('#budget-summary-overview .widget-content').hide();
        $('#budget-summary-overview .widget-body-data-error').show();
    });

    $scope.getHealthClass = function(health) {
        return BudgetSvc.getBudgetStatusClass(health);
    };
    $scope.getStatusText = function(remaining) {
        return BudgetSvc.getBudgetStatusText(remaining);
    };
    $scope.getRemaining = function(remaining) {
        return Math.abs(remaining);
    };
    $scope.getBudgetedText = function(type) {
        return (type === 'summary') ? 'Total amount budgeted:' : 'Your budget:';
    };

}])

.controller('budgetSummaryController', ['$scope', 'BudgetService', function ($scope, BudgetSvc) {

}])

;