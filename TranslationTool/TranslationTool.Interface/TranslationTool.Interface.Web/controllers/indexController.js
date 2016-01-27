(function () {

    var indexController = function ($scope, $filter, $routeParams, $timeout, translationService) {

        function init() {
            $scope.error = '';
            $scope.localeIn = [];
            $scope.localeOut = '';
            $scope.applicationIn = [];
            $scope.applicationOut = [];
            $scope.branchIn = [];
            $scope.branchOut = [];
            $scope.find = null;
            $scope.replace = null;
            $scope.caseSensitive = false;
            $scope.wholeWords = false;
            $scope.sentenceInStatus = '';
            $scope.sentenceIn = [];
            $scope.sentenceInAll = false;
            $scope.sentenceOutStatus = '';
            $scope.sentenceOut = [];
            $scope.sentenceOutAll = true;
        }

        function errorProcess(message) {
            $scope.error = message;
            $timeout(function () {
                $scope.error = '';
            }, 3000);
        }

        function sentenceInStatusProcess() {
            $scope.sentenceInStatus = 'Applications: ' + $scope.applicationIn.length +
                ' Branches: ' + $scope.branchIn.length +
                ' Locales: ' + $scope.localeIn.length +
                ' Found: ' + $scope.sentenceIn.length;
        }

        function sentenceOutStatusProcess() {
            var sentenceInSelected = 0;
            for (var index = 0; index < $scope.sentenceOut.length; index++) {
                if ($scope.sentenceOut[index].selected) {
                    sentenceInSelected++;
                }
            }
            $scope.sentenceOutStatus = 'Total: ' + $scope.sentenceOut.length +
                ' Selected: ' + sentenceInSelected;
        }

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
                    errorProcess('Cannot select - no replace value defined.');
                }
            }
            else {
                indexOf = sentenceIndexOf($scope.sentenceOut, sentence);
                if (indexOf >= 0) {
                    $scope.sentenceOut.splice(indexOf, 1);
                }
            }
            sentenceOutStatusProcess();
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

        function isReplaceable() {
            return ($scope.replace != null && $scope.replace.length > 0);
        }

        $scope.upload = function () {
            var fileReader = new FileReader();
            //Get upload control by id from DOM (index.html), get uploaded file as first array item and read it binary as string asynchronous
            fileReader.readAsBinaryString(document.getElementById('upload').files[0]);
            //Subscribe on load end event
            fileReader.onloadend = function (e) {
                //Get XML file as string and remove XML header
                translationService.load(e.target.result.replace('<?xml version="1.0" encoding="UTF-8"?>', ''));
                if (translationService.exception == null) {
                    //Get control data
                    $scope.localeIn = $filter('orderBy')(translationService.localeSelect(), 'Name', false);
                    $scope.localeOut = ($scope.localeIn.length > 0) ? $scope.localeIn[0] : null;
                    $scope.applicationIn = $filter('orderBy')(translationService.applicationSelect(), 'Name', false);
                    $scope.branchIn = $filter('orderBy')(translationService.branchSelect(), 'Name', false);
                    sentenceInStatusProcess();
                }
                else {
                    errorProcess(translationService.exception.message);
                }
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
                branches: $scope.branchOut.map(function (item) {
                    return item.Name;
                }),
                locale: $scope.localeOut.Name,
                value: $scope.find,
                caseSensitive: $scope.caseSensitive,
                wholeWords: $scope.wholeWords
            });
            if (translationService.exception == null) {
                sentenceInStatusProcess();
            }
            else {
                errorProcess(translationService.exception.message);
            }
        };

        $scope.sentenceInAllSelect = function () {
            var replaceable = isReplaceable();
            if ($scope.sentenceInAll && !replaceable) {
                $scope.sentenceInAll = false;
                errorProcess('Cannot select all items - no replace value defined.');
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
            sentenceOutStatusProcess();
        };

        $scope.sentenceOutSelect = function () {
            sentenceOutStatusProcess();
        };

        $scope.download = function () {
            var output = '';
            for (var index = 0; index < $scope.sentenceOut.length; index++) {
                var sentence = $scope.sentenceOut[index];
                if (sentence.selected) {
                    output += '[' + sentence.key +
                        ']\nreport_language=' + sentence.locale +
                        '\nfileSpec=' + sentence.file +
                        '\napplication=' + sentence.application +
                        '\n' + sentence.locale + '=' + sentence.value +
                        '\n\n';
                }
            }
            if (output.length > 0) {
                window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(output));
            }
            else {
                errorProcess('Cannot download - no selected items.');
            }
        };

        init();

    };

    indexController.$inject = ['$scope', '$filter', '$routeParams', '$timeout', 'translationService'];

    angular.module('translation').controller('indexController', indexController);

}());