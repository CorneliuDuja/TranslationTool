(function () {

    var translationService = function ($http) {

        var factory = {
            exception: null
        };

        //Initialize empty data
        var dictionary = {
            XApplication: [],
            XSentence: []
        };
        var applications = [];
        var locales = [];

        function onStart() {
            $('body').addClass('loading');
        }

        function onSuccess() {
            $('body').removeClass('loading');
        }

        function onError() {
            $('body').removeClass('loading');
        }

        function clearData() {
            dictionary = {
                XApplication: [],
                XSentence: []
            };
            applications = [];
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
            onStart();
            try {
                clearData();
                //Convert XML string into JSON object
                var x2js = new X2JS();
                dictionary = x2js.xml_str2json(data).Dictionary;
                // Convert XApplication to array for single node (see prototype)
                dictionary.XApplication = dictionary.XApplication.toArray();
                //Get applications and locale (maybe branches in the future)
                angular.forEach(dictionary.XApplication, function (xApplication) {
                    if (applicationFind(xApplication._application) == null) {
                        applications.push({Name: xApplication._application});
                    }
                    if (localeFind(xApplication._locale) == null) {
                        locales.push({Name: xApplication._locale});
                    }
                });
                // Convert XSentence, XBranch  and XBranchTranslation to array for single node (see prototype)
                dictionary.XSentence = dictionary.XSentence.toArray();
                angular.forEach(dictionary.XSentence, function (xSentence) {
                    xSentence.XBranch = xSentence.XBranch.toArray();
                    angular.forEach(xSentence.XBranch, function (xBranch) {
                        xBranch.XBranchTranslation = xBranch.XBranchTranslation.toArray();
                    });
                });
                onSuccess();
            }
            catch (exception) {
                factory.exception = exception;
                //Reset data to empty values in case of error
                clearData();
                onError();
            }
        };

        factory.applicationSelect = function () {
            return applications;
        };

        factory.localeSelect = function () {
            return locales;
        };

        factory.sentenceSelect = function (searchApplications, locale, value, caseSensitive, wholeWords) {
            onStart();
            var sentences = [];
            try{
                //Convert passed value to lower case when search is not case sensitive
                if (!caseSensitive) {
                    value = value.toLowerCase();
                }
                for (var xSentenceIndex = 0; xSentenceIndex < dictionary.XSentence.length; xSentenceIndex++) {
                    var xSentence = dictionary.XSentence[xSentenceIndex];
                    // Check if passed application array is null or empty or contains application for current XSentence
                    if (searchApplications != null &&
                        searchApplications.length > 0 &&
                        searchApplications.indexOf(xSentence._application) < 0) {
                        continue;
                    }
                    for (var xBranchIndex = 0; xBranchIndex < xSentence.XBranch.length; xBranchIndex++) {
                        var xBranch = xSentence.XBranch[xBranchIndex];
                        for (var xBranchTranslationIndex = 0; xBranchTranslationIndex < xBranch.XBranchTranslation.length; xBranchTranslationIndex++) {
                            var xBranchTranslation = xBranch.XBranchTranslation[xBranchTranslationIndex];
                            //Check if passed locale is the same as XBranchTranslation locale
                            if (xBranchTranslation._locale != locale) {
                                continue;
                            }
                            //Convert XBranchTranslation value to lower case when search is not case sensitive
                            var branchTranslationValue = xBranchTranslation._value;
                            if (!caseSensitive) {
                                branchTranslationValue = branchTranslationValue.toLowerCase();
                            }
                            //Apply whole words search criteria
                            var found = false;
                            if (wholeWords) {
                                found = (branchTranslationValue == value);
                            }
                            else{
                                found = (branchTranslationValue.indexOf(value) >= 0);
                            }
                            // Add found item to search results
                            if (found) {
                                sentences.push({
                                    application: xSentence._application,
                                    key: xSentence._key,
                                    branch: xBranch._id,
                                    locale: xBranchTranslation._locale,
                                    value: xBranchTranslation._value,
                                    file: fileFind(xSentence._application, xBranch._id, xBranchTranslation._locale)
                                });
                            }
                        }
                    }
                }
                onSuccess();
            }
            catch (exception) {
                factory.exception = exception;
                onError();
            }
            return sentences;
        };

        return factory;

    };

    translationService.$inject = ['$http'];

    angular.module('translation').factory('translationService', translationService);

}());