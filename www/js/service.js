angular.module('App')
.factory('SpendingService', ['$http', '$q', 'orderByFilter', 'filterFilter', function($http, $q, orderByFilter, filterFilter) {

	var TEST_DATA_URL = 'testData/budget/spendingSAW.json'
	var deffered = $q.defer();
 	var transactionData = [];  
 	var spending = {};

	spending.get = function(params) {
		var defaultParams = {
			showSubCategories: false,
			includeBudgetData: true,
			grouping: 'monthly',
			categoryType: [1, 3],
			top: 0
		};
		params = angular.extend({}, defaultParams, params);

	    $http({
			method: 'GET',
			url: TEST_DATA_URL,
			params: params,
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

	    $http({
			method: 'GET',
			url: TEST_DATA_URL,
		 	cache:true
		})
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
	var TEST_DATA_URL = 'testData/account/accounts.json';
 	var accountData = [];  
 	var accountService = {};

	accountService.get = function() {
		var deffered = $q.defer();
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
	var TEST_DATA_URL = 'testData/group/group.json';
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
	var TEST_DATA_URLS = ['testData/transaction/transaction.json', 'testData/transaction/transaction1.json', 'testData/transaction/transactionAllCate.json'];
 	var transactionData = [];
 	var transactionService = {};

	transactionService.get = function(requestParams) {
		var defaultParams = {
		   spending: 1
		};
		requestParams = angular.extend({}, defaultParams, requestParams);
		
		var deffered = $q.defer();
	    $http({
			method: 'GET',
			//url: TEST_DATA_URLS[requestParams.categoryId%2],
			url: TEST_DATA_URLS[(requestParams.searchValue && requestParams.searchValue > 0)?(requestParams.searchValue%2):2],
			params: requestParams
		})
	    .success(function (msg) {
	      transactionData = msg.transactionList;
	      transactionData = _formatData(transactionData);
	      console.log('rest call finished');
	      deffered.resolve();
	    }).error(function (data, status){
            deffered.reject();
            console.log(status);
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
  };
}])

.service('timeFrameHelper', ['moment', function(moment) {
	var _timeFrameOptions = {
		'this-month': {label: 'This month', monthOffSet: 0, yearOffSet: 0},
		'last-month': {label:'Last month', monthOffSet: -1, yearOffSet: 0},
		'this-year': {label:'This Year'},
		'this-month-last-year': {label:'This month last year', monthOffSet: 0, yearOffSet: 0}
	};

	var _getTimeFrameLabelbyKey = function(key) {
		if (_timeFrameOptions.hasOwnProperty(key)) {
			return _timeFrameOptions[key].label;
		}
		else {
			return null;
		}
	};

	var _getMonthYear = function(date) {
        var monthIndex = moment(date).month();
        var yearIndex = moment(date).year();
        return moment().month(monthIndex).format('MMM') + ' ' + moment().year(yearIndex).format('YYYY');
    };

    var _getFromDateEndDate = function(timeFrameKey) {
    	var timeFrameDates = {fromDate: null, toDate: null};
    	var _serverTime = Date.now(); // TODO: need to get server time instead of browser time
    	var _currentYear = _formatTime(_serverTime, 'YYYY');
		var _currentMonth = _formatTime(_serverTime, 'MM');
		var _currentDay = _formatTime(_serverTime, 'DD');

		switch (timeFrameKey) {
			case 'this-month': 
				timeFrameDates.fromDate = _currentYear + '-' + _currentMonth + '-01';
				timeFrameDates.toDate = _currentYear + '-' + _currentMonth + '-' + _currentDay;
				break;
			case 'last-month':
				var lastMonth = _modifyDate(_serverTime, -1, 'months');
				timeFrameDates.fromDate = _modifyDateToBoundary(lastMonth, -1, 'month', 'YYYY-MM-DD');
				timeFrameDates.toDate = _modifyDateToBoundary(lastMonth, 1, 'month', 'YYYY-MM-DD');
				break;
			case 'this-year':
				timeFrameDates.fromDate = _currentYear + '-01-01';
				timeFrameDates.toDate = _currentYear + '-' + _currentMonth + '-' + _currentDay;
				break;
			case 'this-month-last-year':
				timeFrameDates.fromDate = (_currentYear - 1) + '-' + _currentMonth + '-01';
				timeFrameDates.toDate = (_currentYear - 1) + '-' + _currentMonth + '-' + _currentDay;
				break;
			default:
				// defaults to this month
				timeFrameDates.fromDate = _currentYear + '-' + _currentMonth + '-01';
				timeFrameDates.toDate = _currentYear + '-' + _currentMonth + '-' + _currentDay;
				break;
		};

		return timeFrameDates;
    };

	var _formatTime = function(unixtime, format) {
		format = format || 'YYYY-MM-DD';
		moment.locale('en'); //TODO: get locale from server
		var now = moment(unixtime);
		return now.format(format);
	};

	var _modifyDateToBoundary = function(unixtime, modifier, modifyField, format) {
		moment.locale('en');
		var now = moment(unixtime);
		if (modifier < 0) {
			now.startOf(modifyField);
		} else if (modifier > 0) {
			now.endOf(modifyField);
		}

		var ret = (!format) ? now.valueOf() : now.format(format);
		return ret;
	};

	var _modifyDate = function(unixtime, modifier, modifyField, format) {
		moment.locale('en');
		var now = moment(unixtime);
		if (modifier < 0) {
			now.subtract(Math.abs(modifier), modifyField);
		} else {
			now.add(modifyField, modifier);
		}
		var ret = !format ? now.valueOf() : now.format(format);
		return ret;
	};

	var _getMonthYear


	return {
		timeFrameOptions: _timeFrameOptions,
		getTimeFrameLabelbyKey: _getTimeFrameLabelbyKey,
		getMonthYear: _getMonthYear,
		getFromDateEndDate: _getFromDateEndDate
	};
}])


.factory('BudgetService', ['$http', '$q', 'orderByFilter', 'timeFrameHelper', function($http, $q, orderByFilter, timeFrameHelper) {
	var TEST_DATA_URL = ['testData/budget/budget.json', 'testData/budget/budgetByGroupId.json'];
 	var budgetData = [];
 	var budgetDataMap = [];

	var get = function(requestParams) {
		var timeFrameObj = timeFrameHelper.getFromDateEndDate('monthly');
		var defaultParams = {
		   	showSubCategories: true,
			includeBudgetData: true,
			grouping: 'monthly',
			categoryType: [1, 3],
			fromDate: timeFrameObj.fromDate,
        	toDate: timeFrameObj.toDate
		};
		requestParams = angular.extend({}, defaultParams, requestParams);

		var deffered = $q.defer();
	    $http({
			method: 'GET',
			url: TEST_DATA_URL[(parseInt(requestParams.groupId) > 0)?1:0],
			params: requestParams
		})
	    .success(function (msg) {
	      budgetData = transformData(msg);
	      budgetDataMap = transformDataMap(budgetData);
	      deffered.resolve();
	    })
	    .error(function (data, status){
            deffered.reject();
            console.log(status);
	    });
	    
	    return deffered.promise;
	};

	var transformData = function(budgetData) {
		angular.forEach(budgetData, function(data) {
			var monthSpent = (data.spent) ? data.spent : 0;
			var monthCredit = (data.credit) ? data.credit : 0;
			var monthNetSpent = monthSpent - monthCredit;
			data.spent = monthSpent;
			data.netSpent = monthNetSpent;
			data.credit = monthCredit;

			if (data.budgetCustom !== undefined) {		// use budgetCustom first
				data.budget = data.budgetCustom;
				data.budgetType = 'custom';
				data.budgetDefault = 0;
			} else {
				data.budgetType = 'default';
				data.budgetCustom = 0;
				if (data.budgetDefault !== undefined) {	// !budgetCustom, then use budgetDefault
					data.budget = data.budgetDefault;
				} else {
					data.budget = 0;						// !budgetCustom & !budgetDefault, then use 0
					data.budgetDefault = 0;
				}
			}
			data.remaining = data.budget - data.netSpent;
			data.health = (data.budget > 0) ? parseInt(parseFloat((monthNetSpent / data.budget) * 100).toFixed(0), 10) : 0;
		});
		return budgetData;
	};

	var transformDataMap = function() {
		var map = {};
		angular.forEach(budgetData, function(transaction) {
			var dateArr = transaction.date.split('-');
			var monthYear = dateArr[0]+ '-' +dateArr[1];

			if (map.hasOwnProperty(monthYear)) {
				map[monthYear].push(transaction);
			} else {
				map[monthYear] = [transaction];
			}
		});
		return map;
    };

    var getBudgetOverview = function(monthYear) {
    	var budgetObj = {
    		spent: 0,
    		budget: 0,
    		credit: 0,
    		netSpent: 0,
    		health: 0,
    		remaining: 0,
    		categoryId: -1,
    		hasBudgetData: false,
    		type: 'summary',
    		categoryName: 'Overview'
    	};

		if (budgetDataMap.hasOwnProperty(monthYear)) {
			var aggregatedNetSpent = 0, aggregatedBudget = 0, aggregatedHealth = 0, aggregatedRemaining = 0;

			angular.forEach(budgetDataMap[monthYear], function(categoryBudget) {
				aggregatedNetSpent += categoryBudget.netSpent;
				aggregatedBudget += categoryBudget.budget;
				aggregatedRemaining += categoryBudget.remaining;
			});

			budgetObj.hasBudgetData = true;
			budgetObj.netSpent = aggregatedNetSpent;
			budgetObj.budget = aggregatedBudget;
			budgetObj.remaining = aggregatedRemaining;
			budgetObj.health = (aggregatedBudget > 0) ? parseInt(parseFloat((aggregatedNetSpent / aggregatedBudget) * 100).toFixed(0), 10) : 0;
		}
    	return budgetObj;
    };

    var getBudgetStatusClass = function(health) {
    	var warningPercentage = 100;

		var _barClasses = {
			overBudget: 'over-budget',
			nearBudget: 'near-budget',
			underBudget: 'on-budget',
			zeroBar: 'zero-budget',
			credits: 'negative-budget',
			smallBudget: 'small-budget'
		};

	    if(health > 100) {
	        healthClass = _barClasses.overBudget;
	    } else if (health === 0) {
			healthClass = _barClasses.zeroBar;
		} else if (health < 20) {
			healthClass = _barClasses.underBudget + ' ' + _barClasses.smallBudget;
		} else {
			healthClass = _barClasses.underBudget;
		}
	    return healthClass;
    };

    var getBudgetStatusText = function(remainingAmount) {
    	var text = "remaining";
    	if(remainingAmount < 0) {
    		text = "over budget";
    	}
    	return text;
    };

    var getCurrentMonthBudgetOverview = function() {
    	return getBudgetOverview('2016-01');
    };

    var getMonthBudget = function(monthYear) {
    	var data = [];
    	if (budgetDataMap.hasOwnProperty(monthYear)) {
    		data = budgetDataMap[monthYear]
    	}
    	return data;
    };

    var getCurrentMonthBudget = function() {
    	var data = getMonthBudget('2016-01');
    	return orderByFilter(data, '-health');
    };

  	return {
  		get: get,
  		getCurrentMonthBudgetOverview: getCurrentMonthBudgetOverview,
  		getCurrentMonthBudget: getCurrentMonthBudget,
  		getBudgetStatusClass: getBudgetStatusClass,
  		getBudgetStatusText: getBudgetStatusText
  	};	
}])

.factory('TrendsService', ['$http', '$q', 'orderByFilter', function($http, $q, orderByFilter) {
	
 	var trendsData = [];

	var get = function(param) {
		var deffered = $q.defer();
		var defaultParams = {
	        showSubCategories:false,
	        includeBudgetData:false,
	        grouping: 'daily',
	        categoryType: 1,
	        categoryType: 3,
	        fromDate: null,
	        toDate: null,
	        groupId: 'all'
    	};
		param = angular.extend({}, defaultParams, param);

		console.log(param);
		var TEST_DATA_URL = 'testData/budget/spendingDaily.json';
		if(param && param.grouping === 'monthly') {
			TEST_DATA_URL = 'testData/budget/spendingMonthly.json'
		}

		if(param && (param.accountId || parseInt(param.groupId) > 0)) {
			TEST_DATA_URL = 'testData/budget/spendingDaily1.json';
			if(param && param.grouping === 'monthly') { 
				TEST_DATA_URL = 'testData/budget/spendingMonthly1.json';
			}
		}

	    $http.get(TEST_DATA_URL)
		    .success(function (msg) {
		      trendsData = msg;
		      deffered.resolve();
		    })
		    .error(function (data, status){
	            deffered.reject();
		    });
	    
	    return deffered.promise;
	};

	var getRawData = function() {
		angular.forEach(trendsData, function(item) {
			item.credit = (item.credit) ? (item.credit) : 0;
			item.spent = (item.spent) ? (item.spent) : 0;
			item.netSpent = item.spent - item.credit;
		});
		return trendsData;
	};

	var getDataGroupByWeek = function(rawData, numOfMonths) {
		var orderedWeeks = [];
		var _constructWeeklyData = function(data) {
			var weeklyData = [];
			var monthOffSetRange = _getMonthRange(numOfMonths);
			var weekEndDays = ['01', '08', '15', '22', '29'];
			angular.forEach(monthOffSetRange, function(offSet) {
				var yearMonth = moment().subtract(offSet,'months').format('YYYY-MM');

				angular.forEach(weekEndDays, function(endDay) {
					var day = yearMonth + '-' + endDay;
					weeklyData[day] = 0;
					orderedWeeks.push(day);
				});
			});
			return weeklyData;
		};

		var _getMonthRange = function(numOfMonths) {
			var range = [];
			for(var i = numOfMonths-1;i >= 0; i--) {
				 range.push(i);
			}
			return range;
		}

		var _getStartingDate = function(itemDate) {
			var date = itemDate.split('-');
			var year = date[0];
			var month = date[1];
			var day = parseInt(date[2], 10);
			var weekStarting = null;
			if (day <= 7) {
				weekStarting = '01';
			} else if (day <= 14) {
				weekStarting = '08';
			} else if (day <= 21) {
				weekStarting = '15';
			} else if (day <= 28) {
				weekStarting = '22';
			} else {
				weekStarting = '29';
			}
			return year + '-' + month + '-' + weekStarting;
		};

		var _populateWeeklyData = function(weeklyDataArr, rawData) {
			angular.forEach(rawData, function(item) {
				var weekStartDate = _getStartingDate(item.date);

				if(weeklyDataArr.hasOwnProperty(weekStartDate)){
					var netSpent = (item.netSpent) ? item.netSpent : 0;
					weeklyDataArr[weekStartDate] = weeklyDataArr[weekStartDate] + Math.round(netSpent*100)/100;
				}
			});
			return weeklyDataArr;
		};

		var _generateArrayList = function(weeklyData, orderedWeeks) {
			var objListArr = [];
			angular.forEach(orderedWeeks, function(week) {
				objListArr.push({week: week, amount: weeklyData[week]});
			});
			return objListArr;
		};

		var emptyWeeklyData = _constructWeeklyData(rawData);
		var weeklyData = _populateWeeklyData(emptyWeeklyData, rawData);
		weeklyData = _generateArrayList(weeklyData, orderedWeeks);

		return weeklyData;

	};

	var getDataGroupByMonth = function(rawData) {
		var orderedMonths = [];
		var yearMonthList = constructMonths(rawData);
		var monthlyData = _populateMonthlyData(rawData, yearMonthList);
		monthlyData = _generateArrayList(monthlyData, orderedMonths);

		return monthlyData;

		function constructMonths(data) {
			var monthOffSetRange = [0,1,2,3,4,5,6,7,8,9,10,11,12]; // 13 months
			var yearMonthLabel = null;
			var yearMonthList = {};
			angular.forEach(monthOffSetRange, function(offSet) {
				yearMonthLabel = moment().subtract(offSet,'months').format('YYYY-MM');
				Object.defineProperty(yearMonthList, yearMonthLabel, {
				  value: 0,
				  writable: true,
				  enumerable: true
				});
				orderedMonths.push(yearMonthLabel);
			});
			return yearMonthList;
		}

		function _populateMonthlyData(rawData, yearMonthList) {
			angular.forEach(rawData, function(item) {
				var date = item.date.split('-');
				var yearMonth = date[0] + '-' +date[1];
				if(yearMonthList.hasOwnProperty(yearMonth)){
					yearMonthList[yearMonth] = yearMonthList[yearMonth] + item.netSpent;
				}
			});
			return yearMonthList;
		}

		function _generateArrayList(monthlyData, orderedMonths) {
			var objListArr = [];
			angular.forEach(orderedMonths, function(month) {
				objListArr.push({month: month, amount: monthlyData[month]});
			});
			return objListArr;
		};
	};

  	return {
  		get: get,
  		getRawData: getRawData,
  		getDataGroupByWeek: getDataGroupByWeek,
  		getDataGroupByMonth: getDataGroupByMonth
  	};	
}])
.factory('UtilitiesService', ['localStorage', function(localStorage) {

	var addAccountIdOrGroupId = function(param) {
		if(localStorage.get('accountId')){  
			param.accountId = localStorage.get('accountId');
		} else if(localStorage.get('groupId')){
			param.groupId = localStorage.get('groupId');
		}
		return param;
	}

	return {
		addAccountIdOrGroupId: addAccountIdOrGroupId
	};
}])

;