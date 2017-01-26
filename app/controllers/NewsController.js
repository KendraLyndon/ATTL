var attlApp = angular.module('attlApp');
var NewsService = require('../services/NewsService');

module.exports = attlApp.controller('NewsController',function($scope, NewsService){
  $scope.vm = {};
  $scope.vm.news = NewsService.all;
});
