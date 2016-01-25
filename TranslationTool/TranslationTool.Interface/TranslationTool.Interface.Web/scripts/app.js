/**
 * Created by user on 1/20/16.
 */
         (function () {

    var app = angular.module('accessControl', ['ngRoute', 'isteven-multi-select']);

    app.config(['$routeProvider', function ($routeProvider) {

        $routeProvider
            .when('/translation', {
                controller: 'mainController',
                templateUrl: 'views/main.html'
            })
            .otherwise({ redirectTo: '/translation' });

    }]);

    app.run(['$rootScope', '$filter', function ($rootScope, $filter) {

        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            if (next && next.$$route) {
                //if user is not authenticated redirect to login page
            }
        });

    }]);

}());
