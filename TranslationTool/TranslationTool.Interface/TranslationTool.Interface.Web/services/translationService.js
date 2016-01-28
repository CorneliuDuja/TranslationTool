(function () {

    var translationService = function ($http, $q, $timeout) {

        var factory = {
            exception: null,
            context: 'context'
        };

        //Initialize empty data
        var dictionary = {
            XApplication: [],
            XSentence: []
        };
        var applications = [];
        var branches = [];
        var locales = [];

        function clearData() {
            dictionary = {
                XApplication: [],
                XSentence: []
            };
            applications = [];
            branches = [];
            locales = [];
        }

        function applicationFind(name) {
            var application = null;
            for (var index = 0; index < applications.length; index++) {
                if (applications[index].Name == name) {
                    application = applications[index];
                    break;
                }
            }
            return application;
        }

        function branchFind(name) {
            var branch = null;
            for (var index = 0; index < branches.length; index++) {
                if (branches[index].Name == name) {
                    branch = branches[index];
                    break;
                }
            }
            return branch;
        }

        function localeFind(name) {
            var locale = null;
            for (var index = 0; index < locales.length; index++) {
                if (locales[index].Name == name) {
                    locale = locales[index];
                    break;
                }
            }
            return locale;
        }

        function fileFind(application, branch, locale) {
            var file = null;
            for (var xApplicationIndex = 0; xApplicationIndex < dictionary.XApplication.length; xApplicationIndex++) {
                var xApplication = dictionary.XApplication[xApplicationIndex];
                if (xApplication._application == application &&
                    xApplication._branch == branch &&
                    xApplication._locale == locale) {
                    file = xApplication._fileSpec;
                    break;
                }
            }
            return file;
        }

        factory.load = function (data) {
            var deferred = $q.defer();
            $timeout(function () {
                factory.exception = null;
                try {
                    clearData();
                    //Convert XML string into JSON object
                    var x2js = new X2JS();
                    dictionary = x2js.xml_str2json(data).Dictionary;
                    // Convert XApplication to array for single node (see prototype)
                    dictionary.XApplication = dictionary.XApplication.toArray();
                    //Get applications, branches and locales (maybe branches in the future)
                    angular.forEach(dictionary.XApplication, function (xApplication) {
                        if (applicationFind(xApplication._application) == null) {
                            applications.push({Name: xApplication._application});
                        }
                        if (branchFind(xApplication._branch) == null) {
                            branches.push({Name: xApplication._branch});
                        }
                        if (localeFind(xApplication._locale) == null) {
                            if (xApplication._locale != factory.context) {
                                locales.push({Name: xApplication._locale});
                            }
                        }
                    });
                    // Convert XSentence, XBranch  and XBranchTranslation to array for single node (see prototype)
                    dictionary.XSentence = dictionary.XSentence.toArray();
                    angular.forEach(dictionary.XSentence, function (xSentence) {
                        xSentence.XBranch = xSentence.XBranch.toArray();
                        angular.forEach(xSentence.XBranch, function (xBranch) {
                            xBranch.XBranchTranslation = xBranch.XBranchTranslation.toArray();
                            angular.forEach(xBranch.XBranchTranslation, function (xBranchTranslation) {
                                xBranchTranslation._value = decodeURIComponent(escape(xBranchTranslation._value));
                                if (xBranchTranslation._locale == factory.context) {
                                    xBranch.context = xBranchTranslation._value;
                                }
                            });
                        });
                    });
                }
                catch (exception) {
                    factory.exception = exception;
                    //Reset data to empty values in case of error
                    clearData();
                }
                deferred.resolve();
            });
            return deferred.promise;
        };

        factory.applicationSelect = function () {
            return applications;
        };

        factory.branchSelect = function () {
            return branches;
        };

        factory.localeSelect = function () {
            return locales;
        };

        factory.sentenceSelect = function (predicate) {
            var deferred = $q.defer();
            $timeout(function () {
                factory.exception = null;
                var sentences = [];
                try {
                    //Convert passed value to lower case when search is not case sensitive
                    if (!predicate.caseSensitive) {
                        predicate.value = predicate.value.toLowerCase();
                    }
                    for (var xSentenceIndex = 0; xSentenceIndex < dictionary.XSentence.length; xSentenceIndex++) {
                        var xSentence = dictionary.XSentence[xSentenceIndex];
                        // Check if passed application array is null or empty or contains application for current XSentence
                        if (predicate.applications != null &&
                            predicate.applications.length > 0 &&
                            predicate.applications.indexOf(xSentence._application) < 0) {
                            continue;
                        }
                        for (var xBranchIndex = 0; xBranchIndex < xSentence.XBranch.length; xBranchIndex++) {
                            var xBranch = xSentence.XBranch[xBranchIndex];
                            // Check if passed branch array is null or empty or contains branch for current XSentence
                            if (predicate.branches != null &&
                                predicate.branches.length > 0 &&
                                predicate.branches.indexOf(xBranch._id) < 0) {
                                continue;
                            }
                            for (var xBranchTranslationIndex = 0; xBranchTranslationIndex < xBranch.XBranchTranslation.length; xBranchTranslationIndex++) {
                                var xBranchTranslation = xBranch.XBranchTranslation[xBranchTranslationIndex];
                                //Check if passed locale is the same as XBranchTranslation locale
                                if (xBranchTranslation._locale != predicate.locale) {
                                    continue;
                                }
                                //Convert XBranchTranslation value to lower case when search is not case sensitive
                                var branchTranslationValue = xBranchTranslation._value;
                                if (!predicate.caseSensitive) {
                                    branchTranslationValue = branchTranslationValue.toLowerCase();
                                }
                                //Apply whole words search criteria
                                var found = false;
                                if (predicate.wholeWords) {
                                    found = (branchTranslationValue == predicate.value);
                                }
                                else {
                                    found = (branchTranslationValue.indexOf(predicate.value) >= 0);
                                }
                                // Add found item to search results
                                if (found) {
                                    sentences.push({
                                        application: xSentence._application,
                                        key: xSentence._key,
                                        branch: xBranch._id,
                                        locale: xBranchTranslation._locale,
                                        value: xBranchTranslation._value,
                                        context: xBranch.context,
                                        file: fileFind(xSentence._application, xBranch._id, xBranchTranslation._locale),
                                        selected: false
                                    });
                                }
                            }
                        }
                    }
                }
                catch (exception) {
                    factory.exception = exception;
                }
                deferred.resolve(sentences);
            });
            return deferred.promise;
        };

        return factory;

    };

    translationService.$inject = ['$http', '$q', '$timeout'];

    angular.module('translation').factory('translationService', translationService);

}());