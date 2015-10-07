angular.module('App')
.factory('SpendingService', function($http, $q, orderByFilter, filterFilter) {

	var TEST_DATA_URL = 'testData/transaction/allTransaction.json'
	var deffered = $q.defer();
 	var transactionData = [];  
 	var spending = {};

	spending.get = function() {
	    $http({
			method: 'GET',
			url: TEST_DATA_URL,
			params: {test: 'test'},
		 	cache:true
		})
	    .success(function (msg) {
	      transactionData = msg.topList;
	      transactionData = _formatData(transactionData);
	      deffered.resolve();
	    });
	    return deffered.promise;
	  };

	spending.getTopCategories = function() {
		var sortedData = orderByFilter(transactionData, '-netSpending');
		//console.table(sortedData);
		sortedData = filterFilter(sortedData, function(transaction) {
			return transaction.spent > 0;
		});
		return sortedData;
	}

	spending.getTotalNetSpending = function() {
		var spendingSum = 0;
		angular.forEach(transactionData, function(spendingCategory) {
			spendingSum = spendingSum + spendingCategory.netSpending;
		});
		return spendingSum;
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
	return spending;
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
	      //console.log(msg);
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

.factory('TransactionService', function($http, $q, filterFilter) {
	var TEST_DATA_URLS = ['testData/transaction/transaction.json', 'testData/transaction/transaction1.json'];
 	var transactionData = [];
 	var transactionService = {};

	transactionService.get = function(requestParams) {
		var deffered = $q.defer();
	    $http({
			method: 'GET',
			url: TEST_DATA_URLS[requestParams.categoryId%2],
			params: requestParams
		})
	    .success(function (msg) {
	      transactionData = msg.transactionList;
	      transactionData = _formatData(transactionData);
	      console.log('rest call finished');
	      deffered.resolve();
	    });
	    return deffered.promise;
	};

	transactionService.getFormattedTransactionList = function() {
		return transactionData;
	}

	transactionService.getTransactionListGroupbyDate = function() {
		map = {};
		angular.forEach(transactionData, function(transaction) {
			if (map.hasOwnProperty(transaction.date)) {
				//we already have the date object in map, add the transaction to that date object array
				map[transaction.date].push(transaction);
			} else {
				//date object doesnt exist, we create one and add current transaction to array then assign it to object
				map[transaction.date] = [transaction];
			}
		});
		return map;
	}

		//need to move the following helpers to another factory later
	var _formatData = function(transactionData) {
		// take a look at the data and make a little sense of it here, to save extra logic appearing in the template
		var updatedTransactionData = [];
		angular.forEach(transactionData, function(transaction) {
			transaction.date = _getDateText(transaction);
			transaction.fullDescription = (transaction.userDescription) ? transaction.userDescription : _getTransactionDescriptionText(transaction.descriptions);
			updatedTransactionData.push(transaction);
		});
		return updatedTransactionData;
	};

	var _getDateText = function(transaction) {
		//var dateFormat = 'DD-MMM-YYYY'; //to do: get it from property 'TransactionTable.DateFormat'
		var useTransactionEntryDate = true; //to do get it from property
		return useTransactionEntryDate ? transaction.entryDate : transaction.effectiveDate;
	};

	var _getTransactionDescriptionText = function (descriptions) {
		var combinedDescription = '';
        angular.forEach(descriptions, function(description) {
        	combinedDescription = $.trim(combinedDescription + ' ' + $.trim(description));
        });

        return combinedDescription;
    };

  	return transactionService;
})

.service('chartColors', function() {
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