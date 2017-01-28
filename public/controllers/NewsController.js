attlApp.controller('NewsController',function($scope, NewsService){
  $scope.vm = {};
  $scope.vm.news = NewsService.all;
})
