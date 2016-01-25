(function () {

    var shortTimeFilter = function () {

        return function (seconds) {
            var value = '';
            if (seconds != null) {
                if (seconds < 0) {
                    value += '-';
                }
                seconds = Math.abs(seconds);
                var hours = Math.floor(seconds / 3600);
                var minutes = Math.floor((seconds - (hours * 3600)) / 60);
                value += hours + ':' + (minutes > 9 ? minutes : '0' + minutes);
            }
            return value;
        };

    };

    angular.module('accessControl').filter('shortTimeFilter', shortTimeFilter);

}());