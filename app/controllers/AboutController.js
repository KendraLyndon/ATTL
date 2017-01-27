var attlApp = angular.module('attlApp');
var AboutService = require('../services/AboutService');

attlApp.controller("AboutController", function($scope, AboutService) {
  $scope.vm = {};
  $scope.vm.writers = AboutService.writers;
  $scope.vm.actors = AboutService.actors;

});

module.exports = attlApp;
