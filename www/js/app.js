// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('App', ['ionic', 'ui.router', 'highcharts-ng', 'angularMoment'])

.config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', '$provide', function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $provide) {
	$stateProvider.state('home', {
		url: '/home',
		templateUrl: 'templates/home/home.html'
	});
	$stateProvider.state('spendingHome', {
    cache: false,
		url: '/spendingHome',
    controller: 'spendingHomeController',
		templateUrl: 'templates/spendingHome/spendingHome.html'
	});
  $stateProvider.state('spendingSummary', {
    cache: false,
    url: '/spendingSummary',
    controller: 'spendingSummaryController',
    templateUrl: 'templates/spendingHome/spendingSummary.html'
  });
  $stateProvider.state('budgetSummary', {
    cache: false,
    url: '/budgetSummary',
    controller: 'budgetSummaryController',
    templateUrl: 'templates/spendingHome/budgetSummary.html'
  });
  $stateProvider.state('budgetTransactions', {
    cache: false,
    url: '/budgetTransactions',
    controller: 'budgetTransactionsController',
    templateUrl: 'templates/spendingHome/budgetTransactions.html'
  });
  $stateProvider.state('trendsSummary', {
    cache: false,
    url: '/trendsSummary',
    controller: 'trendsSummaryController',
    templateUrl: 'templates/spendingHome/trendsSummary.html'
  });
  $stateProvider.state('changeAccount', {
    url: '/changeAccount',
    controller: 'spendingAccountsController',
    templateUrl: 'templates/spendingHome/changeAccount.html'
  });
  $stateProvider.state('changeMonth', {
    url: '/changeMonth',
    controller: 'changeMonthController',
    templateUrl: 'templates/spendingHome/changeMonth.html'
  });
	$urlRouterProvider.otherwise('/home');
  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.backButton.text('').icon('ion-chevron-left').previousTitleText(false);

  $provide.decorator('$locale', ['$delegate', function($delegate) {
    if($delegate.id == 'en-us') {
      $delegate.NUMBER_FORMATS.PATTERNS[1].negPre = '-\u00A4';
      $delegate.NUMBER_FORMATS.PATTERNS[1].negSuf = '';
    }
    return $delegate;
  }]);
}])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
