angular.module('App')
.factory('TransactionService', function($http, $q, orderByFilter, filterFilter) {

	var TEST_DATA_URL = 'testData/transaction/allTransaction.json'
	var deffered = $q.defer();
 	var transactionData = [];  
 	var transaction = {};

	transaction.get = function() {
	    $http.get(TEST_DATA_URL)
	    .success(function (msg) {
	      transactionData = msg.topList;
	      _formatData(transactionData);
	      deffered.resolve();
	    });
	    return deffered.promise;
	  };

	transaction.getTopCategories = function() {
		var sortedData = orderByFilter(transactionData, '-netSpending');
		console.table(sortedData);
		sortedData = filterFilter(sortedData, function(transaction) {
			return transaction.spent > 0;
		});
		return sortedData;
	}

	//need to move the following helpers to another factory later
	var _formatData = function(spendingData) {
		// take a look at the data and make a little sense of it here, to save extra logic appearing in the template
		var updatedSpendingData = [];
		angular.forEach(spendingData, function(category) {
			var budgeted = 0;
			if (category.hasOwnProperty('budgetCustom')) {
				budgeted = category.budgetCustom;
				category.budgetType = 'custom';
			} else {
				category.budgetType = 'default';
				if (category.hasOwnProperty('budgetDefault')) {
					budgeted = category.budgetDefault;
				}
			}
			var spent = (category.hasOwnProperty('spent')) ? category.spent : 0;
			var credit = (category.hasOwnProperty('credit')) ? category.credit : 0;
			var netSpending = (category.hasOwnProperty('netSpending')) ? category.netSpending : spent - credit;

			var percentage = 0;

			if (budgeted > 0) {
				if (netSpending > 0) {
					//percentage = parseInt(parseFloat((netSpending / budgeted) * 100).toFixed(0), 10);
				}
			} else {
				// can't divide by 0, for $0 budget consider them 'on budget'
				percentage = 100;
			}
			category.spent = spent;
			category.netSpending = netSpending;
			category.budgeted = budgeted;
			category.health = percentage;
			if (spent !== 0 || netSpending !== 0) {
				updatedSpendingData.push(category);
			}
		});
		return updatedSpendingData;
	};
	return transaction;
})

.factory('CategoryService', function($http, $q, filterFilter) {
	var TEST_DATA_URL = 'testData/category/category.json'
	var deffered = $q.defer();
 	var categoryData = [];  
 	var categoryService = {};

	categoryService.get = function() {
	    $http.get(TEST_DATA_URL)
	    .success(function (msg) {
	      categoryData = msg;
	      console.log(msg);
	      deffered.resolve();
	    });
	    return deffered.promise;
	};

	categoryService.getCateNameById = function(id) {
		var matchedData = filterFilter(categoryData, function(category) {
			return category.categoryId === id;
		});
		return (matchedData.length > 0) ? matchedData[0].name : null;
	};
  return categoryService;	
})

.service('chartColors', function($http, $q, orderByFilter, filterFilter) {
	var chartColors = {};
	var chartColorsArr = [
		'#3366CC',
		'#DC3912',
		'#FF9900',
		'#109618',
		'#990099',
		'#0099C6',
		'#DD4477',
		'#66AA00',
		'#B82E2E',
		'#316395',
		'#994499',
		'#FF9900'
	];
	chartColors.getColorbyIndex = function(index) {
		var modIndex = index % 12; //we only have 12 color codes. repeat the color if we need more than 12.
		return chartColorsArr[index];
	}
	return chartColors;
});