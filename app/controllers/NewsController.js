var NewsService = require('../services/NewsService');

module.exports = attlApp.controller('NewsController',function($scope, NewsService){
  $scope.news = {};
});
