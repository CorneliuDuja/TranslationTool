(function () {

    var indexController = function ($scope, $routeParams, translationService) {

        $scope.upload = function (){
            var fileReader = new FileReader();
            //Subscribe on load end event
            fileReader.onloadend = function(e){
                //Get XML file as string and remove XML header
                translationService.load(e.target.result.replace('<?xml version="1.0" encoding="UTF-8"?>', ''));
                $scope.locale = null;
                $scope.locales = translationService.localeSelect();
                if ($scope.locales.length > 0){
                    $scope.locale = $scope.locales[0];
                }
                $scope.searchApplications = [];
                $scope.allApplications = translationService.applicationSelect();
                $scope.$apply();
/*
                var sentences = translationService.sentenceSelect(['SharedResources', 'accounting'], 'en', 'left', false, false);
                sentences = translationService.sentenceSelect(['SharedResources', 'accounting'], 'en', 'left', true, false);
                sentences = translationService.sentenceSelect(['SharedResources', 'accounting'], 'en', 'left', false, true);
                sentences = translationService.sentenceSelect(['SharedResources', 'accounting'], 'en', 'left', true, true);
                var length = sentences.length;
*/
            };
            //Get upload control by id from DOM (index.html), get uploaded file as first array item and read it binary as string asynchronous
            fileReader.readAsBinaryString(document.getElementById('upload').files[0]);
        };

    };

    indexController.$inject = ['$scope', '$routeParams', 'translationService'];

    angular.module('translation').controller('indexController', indexController);

}());