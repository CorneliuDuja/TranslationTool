(function () {

    var translationService = function ($http) {

        var factory = {};

        function onStart() {
            $('body').addClass('loading');
        }

        function onSuccess() {
            $('body').removeClass('loading');
        }

        function onError() {
            $('body').removeClass('loading');
        }

        factory.languageSelect = function () {
            return [
                {Language: 'de'},
                {Language: 'ca'},
                {Language: 'da'}
            ];
        };

        factory.applicationSelect = function () {
            return [
                {Application: 'SharedResources', Name: 'asdfdsfsd'},
                {Application: 'accounting'},
                {Application: 'base'},
                {Application: 'POS'},
                {Application: 'CO'}
            ];
        };

        factory.resourceSelect = function (find, isExact, language, applications) {
            return [
                {Key: 'SharedResources', Language: 'ca', Application: 'POS', Branches: [{Branch: '13.2-MAINT'}, {Branch: '14.2-MAINT'}], Value: 'kuku'},
                {Key: 'SharedResources', Language: 'ca', Application: 'POS', Branches: [{Branch: '13.2-MAINT'}, {Branch: '14.2-MAINT'}], Value: 'kuku'},
                {Key: 'SharedResources', Language: 'ca', Application: 'POS', Branches: [{Branch: '13.2-MAINT'}, {Branch: '14.2-MAINT'}], Value: 'kuku'},
                {Key: 'SharedResources', Language: 'ca', Application: 'POS', Branches: [{Branch: '13.2-MAINT'}, {Branch: '14.2-MAINT'}], Value: 'kuku'},
                {Key: 'SharedResources', Language: 'ca', Application: 'POS', Branches: [{Branch: '13.2-MAINT'}, {Branch: '14.2-MAINT'}], Value: 'kuku'},
                {Key: 'SharedResources', Language: 'ca', Application: 'POS', Branches: [{Branch: '13.2-MAINT'}, {Branch: '14.2-MAINT'}], Value: 'kuku'}
            ];
        };

        return factory;

    };

    translationService.$inject = ['$http'];

    angular.module('translation').factory('translationService', translationService);

}());