/**
 * Created by user on 1/20/16.
 */
(function(){
    var searchController = funtion($scope){

    }
    function getColumnHeaders(){
        $scope.columnHeaders = [];
        $scope.columnHeaders.push('Key');
        $scope.columnHeaders.push('Application');
        $scope.columnHeaders.push('Branches');
        $scope.columnHeaders.push('Value');

        }

    searchController.$inject = ['$scope'];
}());



