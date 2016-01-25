(function () {

    var longTimeFilter = function () {

        return function (seconds) {
            var value = '';
            if (seconds != null) {
                if (seconds < 0) {
                    value += '-';
                }
                seconds = Math.abs(seconds);
                var hours = Math.floor(seconds / 3600);
                var minutes = Math.floor((seconds - (hours * 3600)) / 60);
                if (hours > 0) {
                    value += (hours > 1) ? (hours + ' hours ') : (hours + ' hour ');
                }
                if (minutes >= 0) {
                    value += (minutes > 1) ? (minutes + ' minutes ') : (minutes + ' minute ');
                }
            }
            return value;
        };

    };

    angular.module('accessControl').filter('longTimeFilter', longTimeFilter);

}());