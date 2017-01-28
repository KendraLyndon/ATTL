attlApp.controller("AboutController", function($scope, AboutService) {
  $scope.vm = {};
  $scope.vm.writers = AboutService.writers;
  $scope.vm.actors = AboutService.actors;

})
