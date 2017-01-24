var attlApp = angular.module('attlApp');

attlApp.controller("HomeController", function($scope, NgMap) {
  $scope.vm = {};
  $scope.vm.greeting = "successfull home controller";
  $scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyB5uWq_OelNUbXyUKUhr23Tj3enH6tqQfI"
  NgMap.getMap().then(function(map) {
    console.log(map.getCenter());
    console.log('markers', map.markers);
    console.log('shapes', map.shapes);
  });

});

module.exports = attlApp;
