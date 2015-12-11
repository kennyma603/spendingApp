angular.module('App')
.factory('SpendingService', ['$http', '$q', 'orderByFilter', 'filterFilter', function($http, $q, orderByFilter, filterFilter) {

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
			return transaction.spent > 0 || transaction.credit > 0;
		});
		return sortedData;
	};

	spending.getTotalNetSpending = function() {
		var spendingSum = 0;
		angular.forEach(transactionData, function(spendingCategory) {
			spendingSum = spendingSum + spendingCategory.netSpending;
		});
		return spendingSum;
	};

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
}])

.factory('CategoryService', ['$http', '$q', 'filterFilter', function($http, $q, filterFilter) {
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
}])

.factory('AccountService', ['$http', '$q', 'filterFilter', function($http, $q, filterFilter) {
	var TEST_DATA_URL = 'testData/account/accounts.json'
	var deffered = $q.defer();
 	var accountData = [];  
 	var accountService = {};

	accountService.get = function() {
	    $http.get(TEST_DATA_URL)
	    .success(function (msg) {
	      accountData = msg;
	      deffered.resolve();
	    })
	    .error(function (data, status){
            deffered.reject();
            console.log(status);
	    });
	    
	    return deffered.promise;
	};

	accountService.getFinancialAccounts = function() {
		var accountsToShow = ['memberships', 'partnerAccounts', 'externalAccounts'];
		var arr = [];
		for (var i = 0; i < accountsToShow.length; i++) {
			if(accountData.hasOwnProperty(accountsToShow[i])){
			  arr = arr.concat(accountData[accountsToShow[i]]);
			}
		}
		return arr;
    };

	accountService.getAccountNameById = function(id){
		var accountName = '';

		angular.forEach(accountData, function(financialAccounts, key){
			angular.forEach(financialAccounts, function(financialAccount, key){
				angular.forEach(financialAccount.accounts, function(account, key){					
	 				if (account.accountId === id){
	 					accountName = account.name;
	 				}
				});
			});
		});
		return accountName;
	}
  	return accountService;	
}])

.factory('GroupService', ['$http', '$q', 'filterFilter', function($http, $q, filterFilter) {
	var TEST_DATA_URL = 'testData/group/group.json'
	var deffered = $q.defer();
 	var groupData = [];  
 	var groupService = {};

	groupService.get = function() {
	    $http.get(TEST_DATA_URL)
	    .success(function (msg) {
	      groupData = msg;
	      deffered.resolve();
	    }).error(function (data, status){
            deffered.reject();
	    });
	    return deffered.promise;
	};

	groupService.getGroupList = function() {
		return groupData;
	};

	groupService.getGroupNameById = function(id){
		var matchedData = filterFilter(groupData, function(group) {
			return group.groupId == id;
		});

		return (matchedData.length > 0) ? matchedData[0].groupName : null;
	}

  	return groupService;	
}])

.factory('TransactionService', ['$http', '$q', 'filterFilter', 'orderByFilter', function($http, $q, filterFilter, orderByFilter) {
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
	};

	transactionService.getTransactionMapGroupbyDate = function(options) {
		var defaultOptions = {
			order: 'asc'
		};
		options = angular.extend({}, defaultOptions, options);
		var map = {};
		var dateOrder = []; // associated array has random order, so we need this array to track transaction order.
		var orderBy = (options.order === 'asc') ? '+date' : '-date';
		var sortedData = orderByFilter(transactionData, orderBy);
		angular.forEach(sortedData, function(transaction) {
			if (map.hasOwnProperty(transaction.date)) {
				//we already have the date object in map, add the transaction to that date object array
				map[transaction.date].push(transaction);
			} else {
				//date object doesnt exist, we create one and add current transaction to array then assign it to object
				map[transaction.date] = [transaction];
				dateOrder.push(transaction.date);
			}
		});
		return {dateOrderArray: dateOrder, transactionMap: map};
	};

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
}])

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
	};
	return chartColors;
})

.service('localStorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}]);
;