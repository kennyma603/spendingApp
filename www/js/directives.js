angular.module('App')
.directive('c1MSpendingSubheading', function() {
    return {
        restrict: 'E',
        scope: {
            prop: '=',
            type: '@'
        },
        templateUrl: 'templates/directive/c1-m-spending-subheading.html',
        controller: 'spendingSubheadingCtrl'
    }
})
.directive('c1MSpendingWidgetHeading', function() {
    return {
        restrict: 'E',
        scope: {
            prop: '=',
            heading: '@heading'
        },
        templateUrl: 'templates/directive/c1-m-spending-widget-heading.html'
    }
})
.directive('c1MSpendingPieChart', function() {
    return {
        restrict: 'E',
        scope: {
            prop: '=',
            height: '@'
        },
        templateUrl: 'templates/directive/c1-m-spending-pie-chart.html',
        controller: 'spendingPieChartCtrl'
    }
})
.directive('c1MSpendingTrendsChart', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            prop: '=',
            numOfMonths: '@'
        },
        templateUrl: 'templates/directive/c1-m-spending-trends-chart.html',
        controller: 'spendingTrendsChartCtrl'
    }
})
.directive('c1MSpendingCategoryList', function() {
    return {
        restrict: 'E',
        scope: {
            prop: '=',
            numberofCate: '@numberOfCategory',
            onClickLoadTransaction: '@'
        },
        templateUrl: 'templates/directive/c1-m-spending-category-list.html',
        controller: 'spendingCategoryListCtrl'
    }
})
.directive('c1MSpendingTrendsMonthlyList', function() {
    return {
        restrict: 'E',
        scope: {
            prop: '=',
            numberofCate: '@numberOfCategory',
            onClickLoadTransaction: '@'
        },
        templateUrl: 'templates/directive/c1-m-spending-trends-monthly-list.html',
        controller: 'spendingTrendsMonthlyListCtrl'
    }
})
.directive('c1MSpendingSelectedCategoryTransList', function() {
    return {
        restrict: 'E',
        scope: {
            prop: '=',
            categoryId: '=',
            queryObj: '='
        },
        templateUrl: 'templates/directive/c1-m-spending-selected-category-trans-list.html',
        controller: 'spendingSelectedCategoryTransListCtrl'
    }
})
.directive('c1MSpendingBudgetItem', function() {
    return {
        restrict: 'E',
        scope: {
            showOverview: '@',
            showCategory: '@'
        },
        templateUrl: 'templates/directive/c1-m-spending-budget-item.html',
        controller: 'spendingBudgetItemCtrl'
    }
})
;