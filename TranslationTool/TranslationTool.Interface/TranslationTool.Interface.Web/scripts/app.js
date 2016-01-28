(function () {

    var app = angular.module('translation', ['ngRoute', 'isteven-multi-select']);

    app.config(['$routeProvider', function ($routeProvider) {

        $routeProvider
            .when('/translation', {
                controller: 'indexController',
                templateUrl: 'index.html'
            })
            .otherwise({ redirectTo: '/translation' });

    }]);

    app.run(['$rootScope', '$filter', function ($rootScope, $filter) {

        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            if (next && next.$$route) {
                //if user is not authenticated redirect to login page
            }
        });

        $rootScope.onStart = function () {
            $('body').addClass('loading');
        };

        $rootScope.onSuccess = function () {
            $('body').removeClass('loading');
        };

        $rootScope.onError = function () {
            $('body').removeClass('loading');
        };

    }]);

}());
