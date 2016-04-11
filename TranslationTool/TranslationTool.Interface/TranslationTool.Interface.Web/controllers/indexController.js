(function () {

    var indexController = function ($scope, $filter, $routeParams, $q, $timeout, translationService) {

        function init() {
            $scope.error = '';
            $scope.errorDelay = 5000;
            $scope.defferDelay = 100;
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
            var processed = true;
            if (message == null ||
                message.length == 0) {
                processed = false;
            }
            else {
                $scope.error = message;
                $timeout(function () {
                    $scope.error = '';
                }, $scope.errorDelay);
            }
            return processed;
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

        function sentenceInProcess(sentence, replaceable, regExpModifiers) {
            var message = '';
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
                            value: sentence.value,
                            replace: $scope.wholeWords ? $scope.replace : sentence.value.replace(new RegExp($scope.find, regExpModifiers), $scope.replace),
                            file: sentence.file,
                            selected: true
                        });
                    }
                }
                else {
                    sentence.selected = false;
                    message = 'Cannot select - no find or replace value defined.';
                }
            }
            else {
                indexOf = sentenceIndexOf($scope.sentenceOut, sentence);
                if (indexOf >= 0) {
                    $scope.sentenceOut.splice(indexOf, 1);
                }
            }
            return message;
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
            var replaceable = ($scope.replace != null && $scope.replace.length > 0);
            if (!$scope.wholeWords) {
                replaceable = replaceable && ($scope.find != null && $scope.find.length > 0);
            }
            return replaceable;
        }

        function getRegExpModifiers() {
            return $scope.caseSensitive ? 'g' : 'ig';
        }

        function selectSentenceInAll(replaceable) {
            var deferred = $q.defer();
            $timeout(function () {
                var regExpModifiers = getRegExpModifiers();
                for (var index = 0; index < $scope.sentenceIn.length; index++) {
                    var sentence = $scope.sentenceIn[index];
                    if (sentence.selected != $scope.sentenceInAll) {
                        sentence.selected = $scope.sentenceInAll;
                        sentenceInProcess(sentence, replaceable, regExpModifiers);
                    }
                }
                deferred.resolve();
            }, $scope.defferDelay);
            return deferred.promise;
        }

        function selectSentenceOutAll() {
            var deferred = $q.defer();
            $timeout(function () {
                for (var index = 0; index < $scope.sentenceOut.length; index++) {
                    $scope.sentenceOut[index].selected = $scope.sentenceOutAll;
                }
                deferred.resolve();
            }, $scope.defferDelay);
            return deferred.promise;
        }

        function outputProcess() {
            var deferred = $q.defer();
            $timeout(function () {
                var output = '';
                var sentences = {};
                for (var index = 0; index < $scope.sentenceOut.length; index++) {
                    var sentence = $scope.sentenceOut[index];
                    if (sentence.selected) {
                        //output += '[' + sentence.key +
                        //    ']\nreport_language=' + sentence.locale +
                        //   '\nfilespec=' + sentence.file +
                        //    '\napplication=' + sentence.application +
                        //    '\n' + sentence.locale + '=' + sentence.replace +
                        //    '\n\n';
                        var key = sentence.key + sentence.locale + sentence.application + sentence.replace;
                        if (sentences[key] === undefined){
                            sentences[key] = {
                                key: sentence.key,
                                locale: sentence.locale,
                                application: sentence.application,
                                value: sentence.replace,
                                files: []
                            };
                        }
                        sentences[key].files.push(sentence.file);
                    }
                }
                Object.keys(sentences).forEach(function (key) {
                    var sentence = sentences[key];
                    output += '[' + sentence.key + ']\nreport_language=' + sentence.locale;
                    for (var index = 0; index < sentence.files.length; index++){
                        output += '\nfilespec=' + sentence.files[index];
                    }
                    output += '\napplication=' + sentence.application + '\n' + sentence.locale + '=' + sentence.value + '\n\n';
                });
                deferred.resolve(output);
            }, $scope.defferDelay);
            return deferred.promise;
        }

        $scope.upload = function () {
            $scope.onStart();
            var fileReader = new FileReader();
            //Get upload control by id from DOM (index.html), get uploaded file as first array item and read it binary as string asynchronous
            try {
                fileReader.readAsBinaryString(document.getElementById('upload').files[0]);
            }
            catch (exception) {
                $scope.onError();
                errorProcess(exception.message);
            }
            //Subscribe on load end event
            fileReader.onloadend = function (e) {
                //Get XML file as string and remove XML header
                translationService.load(e.target.result.replace('<?xml version="1.0" encoding="UTF-8"?>', '')).then(function () {
                    $scope.onSuccess();
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
                });
            };
        };

        $scope.search = function () {
            $scope.onStart();
            $scope.sentenceInAll = false;
            translationService.sentenceSelect({
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
            }).then(function (response) {
                    $scope.sentenceIn = response;
                    $scope.onSuccess();
                    if (translationService.exception == null) {
                        sentenceInStatusProcess();
                    }
                    else {
                        errorProcess(translationService.exception.message);
                    }
                });
        };

        $scope.sentenceInAllSelect = function () {
            var replaceable = isReplaceable();
            if ($scope.sentenceInAll && !replaceable) {
                $scope.sentenceInAll = false;
                errorProcess('Cannot select all items - no find or replace value defined.');
                return;
            }
            $scope.onStart();
            selectSentenceInAll(replaceable).then(function () {
                $scope.onSuccess();
                sentenceOutStatusProcess();
            });
        };

        $scope.sentenceInSelect = function (sentence) {
            if (!errorProcess(sentenceInProcess(sentence, isReplaceable(), getRegExpModifiers()))) {
                sentenceOutStatusProcess();
            }
        };

        $scope.sentenceOutAllSelect = function () {
            $scope.onStart();
            selectSentenceOutAll().then(function () {
                $scope.onSuccess();
                sentenceOutStatusProcess();
            });
        };

        $scope.sentenceOutSelect = function () {
            sentenceOutStatusProcess();
        };

        $scope.download = function () {
            $scope.onStart();
            outputProcess().then(function (response) {
                $scope.onSuccess();
                if (response.length > 0) {
                    window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(response));
                }
                else {
                    errorProcess('Cannot download - no selected items.');
                }
            });
        };

        init();

    };

    indexController.$inject = ['$scope', '$filter', '$routeParams', '$q', '$timeout', 'translationService'];

    angular.module('translation').controller('indexController', indexController);

}());