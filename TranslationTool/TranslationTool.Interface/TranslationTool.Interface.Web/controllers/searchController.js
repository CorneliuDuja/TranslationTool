/**
 * Created by user on 1/20/16.
 */
angular.module('sortApp', [])

    .controller('searchController', function($scope) {
        $scope.sortType     = 'key'; // set the default sort type
        $scope.sortReverse  = false;  // set the default sort order
        $scope.searchKey   = '';     // set the default search/filter term

        // create the list of sushi rolls
        $scope.find = [
            { key: 'action.refund.item', application: 'POS', branch: '14.1-MAINT', value: 'Refundovat polozku', check: 'check' },
            { key: 'action.refund.item', application: 'CO', branch: '14.1-MAINT', value: 'Refundovat polozku', check: 'check'  },
            { key: 'column.item.id', application: 'CO', branch: '15.1-MAINT', value: 'Refundovat polozku' , check: 'check' },
            { key: 'palette.suspend.order', application: 'CO', branch: '14.1-MAINT', value: 'Refundovat polozku', check: 'check'  }
        ];

    });



