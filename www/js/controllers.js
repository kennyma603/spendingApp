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

.controller('spendingBudgetItemCtrl', ['$scope', 'BudgetService', 'CategoryService', '$timeout', function ($scope, BudgetSvc, CategorySvc, $timeout) {
    
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

        /*
        if($scope.budgetArray.length > 0) {
            $('#budget-summary-overview .widget-content').hide();
            $('#budget-summary-overview .widget-body-has-data').show();
        } else {
            $('#budget-summary-overview .widget-content').hide();
            $('#budget-summary-overview .widget-body-no-data').show();
        }
        */

    }, function(reason){
        /*
        $('#budget-summary-overview .widget-content').hide();
        $('#budget-summary-overview .widget-body-data-error').show();
        */
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

    $scope.getHealthCSS = function(health) {
        return 'style="width: ' + health + '%"';
    };

    $scope.showprogress = false;
    var timer = $timeout(function(){
  $scope.showprogress = true;
  console.log('hello');
  $timeout.cancel(timer); // I automatically cancel myself after running.
}, 100);

}])

.controller('budgetSummaryController', ['$scope', 'BudgetService', function ($scope, BudgetSvc) {

}])

.controller('spendingLineChartCtrl', ['$scope', '$timeout', function ($scope, $timeout) {

    $scope.TrendsChartConfig = {
       "options":{
          "chart":{
                marginLeft: 50,
                spacingBottom: 0,
                spacingLeft: 0,
                spacingRight: 0,
                type: 'line',
                height: 150
          },
          "plotOptions":{
             "series":{
                "stacking":""
             },
            xAxis: {
                labels: {
                             events: {
                                 click: function () {
                                    alert('hi');
                                     }
                            }
                }
            }
          }
       },
       "series":[
          {
             "data":[[1370131200000,0.7695],[1370217600000,0.7648],[1370304000000,0.7645],[1370390400000,0.7638],[1370476800000,0.7549],[1370563200000,0.7562],[1370736000000,0.7574],[1370822400000,0.7543],[1370908800000,0.751],[1370995200000,0.7498],[1371081600000,0.7477],[1371168000000,0.7492],[1371340800000,0.7487],[1371427200000,0.748],[1371513600000,0.7466],[1371600000000,0.7521],[1371686400000,0.7564],[1371772800000,0.7621],[1371945600000,0.763],[1372032000000,0.7623],[1372118400000,0.7644],[1372204800000,0.7685],[1372291200000,0.7671],[1372377600000,0.7687],[1372550400000,0.7687],[1372636800000,0.7654],[1372723200000,0.7705],[1372809600000,0.7687],[1372896000000,0.7744],[1372982400000,0.7793],[1373155200000,0.7804],[1373241600000,0.777],[1373328000000,0.7824],[1373414400000,0.7705],[1373500800000,0.7635],[1373587200000,0.7652],[1373760000000,0.7656],[1373846400000,0.7655],[1373932800000,0.7598],[1374019200000,0.7619],[1374105600000,0.7628],[1374192000000,0.7609],[1374364800000,0.7599],[1374451200000,0.7584],[1374537600000,0.7562],[1374624000000,0.7575],[1374710400000,0.7531],[1374796800000,0.753],[1374969600000,0.7526],[1375056000000,0.754],[1375142400000,0.754],[1375228800000,0.7518],[1375315200000,0.7571],[1375401600000,0.7529],[1375574400000,0.7532],[1375660800000,0.7542],[1375747200000,0.7515],[1375833600000,0.7498],[1375920000000,0.7473],[1376006400000,0.7494],[1376179200000,0.7497],[1376265600000,0.7519],[1376352000000,0.754],[1376438400000,0.7543],[1376524800000,0.7492],[1376611200000,0.7502],[1376784000000,0.7503],[1376870400000,0.7499],[1376956800000,0.7453],[1377043200000,0.7487],[1377129600000,0.7487],[1377216000000,0.7472],[1377388800000,0.7471],[1377475200000,0.748],[1377561600000,0.7467],[1377648000000,0.7497],[1377734400000,0.7552],[1377820800000,0.7562],[1377993600000,0.7572],[1378080000000,0.7581],[1378166400000,0.7593],[1378252800000,0.7571],[1378339200000,0.7622],[1378425600000,0.7588],[1378598400000,0.7591],[1378684800000,0.7544],[1378771200000,0.7537],[1378857600000,0.7512],[1378944000000,0.7519],[1379030400000,0.7522],[1379203200000,0.7486],[1379289600000,0.75],[1379376000000,0.7486],[1379462400000,0.7396],[1379548800000,0.7391],[1379635200000,0.7394],[1379808000000,0.7389],[1379894400000,0.7411],[1379980800000,0.7422],[1380067200000,0.7393],[1380153600000,0.7413],[1380240000000,0.7396],[1380412800000,0.741],[1380499200000,0.7393],[1380585600000,0.7393],[1380672000000,0.7365],[1380758400000,0.7343],[1380844800000,0.7376],[1381017600000,0.737],[1381104000000,0.7362],[1381190400000,0.7368],[1381276800000,0.7393],[1381363200000,0.7397],[1381449600000,0.7385],[1381622400000,0.7377],[1381708800000,0.7374],[1381795200000,0.7395],[1381881600000,0.7389],[1381968000000,0.7312],[1382054400000,0.7307],[1382227200000,0.7309],[1382313600000,0.7308],[1382400000000,0.7256],[1382486400000,0.7258],[1382572800000,0.7247],[1382659200000,0.7244],[1382832000000,0.7244],[1382918400000,0.7255],[1383004800000,0.7275],[1383091200000,0.728],[1383177600000,0.7361],[1383264000000,0.7415],[1383436800000,0.7411],[1383523200000,0.7399],[1383609600000,0.7421],[1383696000000,0.74],[1383782400000,0.7452],[1383868800000,0.7479],[1384041600000,0.7492],[1384128000000,0.746],[1384214400000,0.7442],[1384300800000,0.7415],[1384387200000,0.7429],[1384473600000,0.741],[1384646400000,0.7417],[1384732800000,0.7405],[1384819200000,0.7386],[1384905600000,0.7441],[1384992000000,0.7418],[1385078400000,0.7376],[1385251200000,0.7379],[1385337600000,0.7399],[1385424000000,0.7369],[1385510400000,0.7365],[1385596800000,0.735],[1385683200000,0.7358],[1385856000000,0.7362],[1385942400000,0.7385],[1386028800000,0.7359],[1386115200000,0.7357],[1386201600000,0.7317],[1386288000000,0.7297],[1386460800000,0.7296],[1386547200000,0.7279],[1386633600000,0.7267],[1386720000000,0.7254],[1386806400000,0.727],[1386892800000,0.7276],[1387065600000,0.7278],[1387152000000,0.7267],[1387238400000,0.7263],[1387324800000,0.7307],[1387411200000,0.7319],[1387497600000,0.7315],[1387670400000,0.7311],[1387756800000,0.7301],[1387843200000,0.7308],[1387929600000,0.731],[1388016000000,0.7304],[1388102400000,0.7277],[1388275200000,0.7272],[1388361600000,0.7244],[1388448000000,0.7275],[1388534400000,0.7271],[1388620800000,0.7314],[1388707200000,0.7359],[1388880000000,0.7355],[1388966400000,0.7338],[1389052800000,0.7345],[1389139200000,0.7366],[1389225600000,0.7349],[1389312000000,0.7316],[1389484800000,0.7315],[1389571200000,0.7315],[1389657600000,0.731],[1389744000000,0.735],[1389830400000,0.7341],[1389916800000,0.7385],[1390089600000,0.7392],[1390176000000,0.7379],[1390262400000,0.7373],[1390348800000,0.7381],[1390435200000,0.7301],[1390521600000,0.7311],[1390694400000,0.7306],[1390780800000,0.7314],[1390867200000,0.7316],[1390953600000,0.7319],[1391040000000,0.7377],[1391126400000,0.7415],[1391299200000,0.7414],[1391385600000,0.7393],[1391472000000,0.7397],[1391558400000,0.7389],[1391644800000,0.7358],[1391731200000,0.7334],[1391904000000,0.7343],[1391990400000,0.7328],[1392076800000,0.7332],[1392163200000,0.7356],[1392249600000,0.7309],[1392336000000,0.7304],[1392508800000,0.73],[1392595200000,0.7295],[1392681600000,0.7268],[1392768000000,0.7281],[1392854400000,0.7289],[1392940800000,0.7278],[1393113600000,0.728],[1393200000000,0.728],[1393286400000,0.7275],[1393372800000,0.7306],[1393459200000,0.7295],[1393545600000,0.7245],[1393718400000,0.7259],[1393804800000,0.728],[1393891200000,0.7276],[1393977600000,0.7282],[1394064000000,0.7215],[1394150400000,0.7206],[1394323200000,0.7206],[1394409600000,0.7207],[1394496000000,0.7216],[1394582400000,0.7192],[1394668800000,0.721],[1394755200000,0.7187],[1394928000000,0.7188],[1395014400000,0.7183],[1395100800000,0.7177],[1395187200000,0.7229],[1395273600000,0.7258],[1395360000000,0.7249],[1395532800000,0.7247],[1395619200000,0.7226],[1395705600000,0.7232],[1395792000000,0.7255],[1395878400000,0.7278],[1395964800000,0.7271],[1396137600000,0.7272],[1396224000000,0.7261],[1396310400000,0.725],[1396396800000,0.7264],[1396483200000,0.7289],[1396569600000,0.7298],[1396742400000,0.7298],[1396828800000,0.7278],[1396915200000,0.7248],[1397001600000,0.7218],[1397088000000,0.72],[1397174400000,0.7202],[1397347200000,0.7222],[1397433600000,0.7236],[1397520000000,0.7239],[1397606400000,0.7238],[1397692800000,0.7238],[1397779200000,0.7238],[1397952000000,0.7239],[1398038400000,0.725],[1398124800000,0.7244],[1398211200000,0.7238],[1398297600000,0.7229],[1398384000000,0.7229],[1398556800000,0.7226],[1398643200000,0.722],[1398729600000,0.724],[1398816000000,0.7211],[1398902400000,0.721],[1398988800000,0.7209],[1399161600000,0.7209],[1399248000000,0.7207],[1399334400000,0.718],[1399420800000,0.7188],[1399507200000,0.7225],[1399593600000,0.7268],[1399766400000,0.7267],[1399852800000,0.7269],[1399939200000,0.7297],[1400025600000,0.7291],[1400112000000,0.7294],[1400198400000,0.7302],[1400371200000,0.7298],[1400457600000,0.7295],[1400544000000,0.7298],[1400630400000,0.7307],[1400716800000,0.7323],[1400803200000,0.7335],[1400976000000,0.7338],[1401062400000,0.7329],[1401148800000,0.7335],[1401235200000,0.7358],[1401321600000,0.7351],[1401408000000,0.7337],[1401580800000,0.7338],[1401667200000,0.7355],[1401753600000,0.7338],[1401840000000,0.7353],[1401926400000,0.7321],[1402012800000,0.733],[1402185600000,0.7327],[1402272000000,0.7356],[1402358400000,0.7381],[1402444800000,0.7389],[1402531200000,0.7379],[1402617600000,0.7384],[1402790400000,0.7388],[1402876800000,0.7367],[1402963200000,0.7382],[1403049600000,0.7356],[1403136000000,0.7349],[1403222400000,0.7353],[1403395200000,0.7357],[1403481600000,0.735],[1403568000000,0.735],[1403654400000,0.7337],[1403740800000,0.7347],[1403827200000,0.7327],[1404000000000,0.733],[1404086400000,0.7304],[1404172800000,0.731],[1404259200000,0.732],[1404345600000,0.7347],[1404432000000,0.7356],[1404604800000,0.736],[1404691200000,0.735],[1404777600000,0.7346],[1404864000000,0.7329],[1404950400000,0.7348],[1405036800000,0.7349],[1405209600000,0.7352],[1405296000000,0.7342],[1405382400000,0.7369],[1405468800000,0.7393],[1405555200000,0.7392],[1405641600000,0.7394],[1405814400000,0.739],[1405900800000,0.7395],[1405987200000,0.7427],[1406073600000,0.7427],[1406160000000,0.7428],[1406246400000,0.7446],[1406419200000,0.7447],[1406505600000,0.744],[1406592000000,0.7458]]
                 }
       ],
            title:{
                text: null
            },
                        xAxis: {
                type: 'datetime',
                labels: {
                             events: {
                                 click: function () {
                                    alert('hi');
                                     }
                            }
                }
            }
    };

}])

;