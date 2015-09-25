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
            heading: '@heading',
            link: '@link'
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
});