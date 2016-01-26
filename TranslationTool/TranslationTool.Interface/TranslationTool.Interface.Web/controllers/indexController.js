(function () {

    var indexController = function ($scope, $filter, $routeParams, translationService) {

        $scope.upload = function () {
            var fileReader = new FileReader();
            //Get upload control by id from DOM (index.html), get uploaded file as first array item and read it binary as string asynchronous
            fileReader.readAsBinaryString(document.getElementById('upload').files[0]);
            //Subscribe on load end event
            fileReader.onloadend = function(e) {
                //Get XML file as string and remove XML header
                translationService.load(e.target.result.replace('<?xml version="1.0" encoding="UTF-8"?>', ''));
                //Get control data
                $scope.searchApplications = [];
                $scope.allApplications = $filter('orderBy')(translationService.applicationSelect(), 'Name', false);
                $scope.locale = null;
                $scope.locales = $filter('orderBy')(translationService.localeSelect(), 'Name', false);
                if ($scope.locales.length > 0) {
                    $scope.locale = $scope.locales[0];
                }
                //Redraw controls
                $scope.$apply();
            };
        };

        $scope.search = function () {
            $scope.sentences = translationService.sentenceSelect(['SharedResources', 'accounting'], 'en', 'left', false, false);
        };

    };

    indexController.$inject = ['$scope', '$filter', '$routeParams', 'translationService'];

    angular.module('translation').controller('indexController', indexController);

}());