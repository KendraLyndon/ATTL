var attlApp = angular.module('attlApp');

attlApp.controller("HomeController", function($scope) {
    // Do stuff with your $scope.
    // Note: Some of the directives require at least something to be defined originally!
    // e.g. $scope.markers = []
    $scope.vm = {};
    // $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
    // uiGmapGoogleMapApi is a promise.
    // The "then" callback function provides the google.maps object.
    // uiGmapGoogleMapApi.then(function(maps) {
    //
    // });
});

module.exports = attlApp;
