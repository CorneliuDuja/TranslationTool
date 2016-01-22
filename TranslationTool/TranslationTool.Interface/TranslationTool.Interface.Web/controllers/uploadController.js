/**
 * Created by user on 1/20/16.
 */
$scope.add = function(){
    var f = document.getElementById('file').files[0],
        r = new FileReader();
    r.onloadend = function(e){
        var data = e.target.result;
        //send you binary data via $http or $resource or do anything else with it
    }
    r.readAsBinaryString(f);
}
