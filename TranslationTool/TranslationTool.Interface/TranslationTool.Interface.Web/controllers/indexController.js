(function () {

    var indexController = function ($scope, $filter, $routeParams, translationService) {

        $scope.upload = function () {
            var fileReader = new FileReader();
            //Get upload control by id from DOM (index.html), get uploaded file as first array item and read it binary as string asynchronous
            fileReader.readAsBinaryString(document.getElementById('upload').files[0]);
            //Subscribe on load end event
            fileReader.onloadend = function (e) {
                //Get XML file as string and remove XML header
                translationService.load(e.target.result.replace('<?xml version="1.0" encoding="UTF-8"?>', ''));
                //Get control data
                $scope.find = null;
                $scope.replace = null;
                $scope.caseSensitive = false;
                $scope.wholeWords = false;
                $scope.applicationIn = $filter('orderBy')(translationService.applicationSelect(), 'Name', false);
                $scope.applicationOut = [];
                $scope.localeIn = $filter('orderBy')(translationService.localeSelect(), 'Name', false);
                $scope.localeOut = ($scope.localeIn.length > 0) ? $scope.localeIn[0] : null;
                $scope.sentenceIn = [];
                $scope.sentenceInAll = false;
                $scope.sentenceOut = [];
                $scope.sentenceOutAll = true;
                //Redraw controls
                $scope.$apply();
            };
        };

        $scope.search = function () {
            $scope.sentenceInAll = false;
            $scope.sentenceIn = translationService.sentenceSelect({
                applications: $scope.applicationOut.map(function (item) {
                    return item.Name;
                }),
                locale: $scope.localeOut.Name,
                value: $scope.find,
                caseSensitive: $scope.caseSensitive,
                wholeWords: $scope.wholeWords
            });
        };

        $scope.sentenceInAllSelect = function () {
            var replaceable = isReplaceable();
            if ($scope.sentenceInAll && !replaceable) {
                $scope.sentenceInAll = false;
                return;
            }
            for (var index = 0; index < $scope.sentenceIn.length; index++) {
                var sentence = $scope.sentenceIn[index];
                if (sentence.selected != $scope.sentenceInAll) {
                    sentence.selected = $scope.sentenceInAll;
                    sentenceInProcess(sentence, replaceable);
                }
            }
        };

        $scope.sentenceInSelect = function (sentence) {
            sentenceInProcess(sentence, isReplaceable());
        };

        $scope.sentenceOutAllSelect = function () {
            for (var index = 0; index < $scope.sentenceOut.length; index++) {
                $scope.sentenceOut[index].selected = $scope.sentenceOutAll;
            }
        };

        $scope.download = function () {
            var typedArray = 'asdfasdfasdfasdgfasdg';
            var blob = new Blob([typedArray], {type: 'application/octet-binary'});
            var url = URL.createObjectURL(blob);
        };

        function sentenceInProcess(sentence, replaceable) {
            var indexOf = 0;
            if (sentence.selected) {
                if (replaceable) {
                    indexOf = sentenceIndexOf($scope.sentenceOut, sentence);
                    if (indexOf < 0) {
                        $scope.sentenceOut.push({
                            application: sentence.application,
                            key: sentence.key,
                            branch: sentence.branch,
                            locale: sentence.locale,
                            value: $scope.replace,
                            file: sentence.file,
                            selected: true
                        });
                    }
                }
                else {
                    sentence.selected = false;
                }
            }
            else {
                indexOf = sentenceIndexOf($scope.sentenceOut, sentence);
                if (indexOf >= 0) {
                    $scope.sentenceOut.splice(indexOf, 1);
                }
            }
        }

        function isReplaceable() {
            return ($scope.replace != null && $scope.replace.length > 0);
        }

        function sentenceIndexOf(sentences, sentence) {
            var indexOf = -1;
            for (var index = 0; index < sentences.length; index++) {
                if (sentences[index].application == sentence.application &&
                    sentences[index].key == sentence.key &&
                    sentences[index].branch == sentence.branch &&
                    sentences[index].locale == sentence.locale) {
                    indexOf = index;
                    break;
                }
            }
            return indexOf;
        }

    };

    indexController.$inject = ['$scope', '$filter', '$routeParams', 'translationService'];

    angular.module('translation').controller('indexController', indexController);

}());