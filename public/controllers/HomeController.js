attlApp.controller("HomeController", function($scope, HomeService) {

  $scope.vm = {};
  $scope.vm.showtimes = HomeService.showtimes;
  $scope.vm.photos = HomeService.photos;
  $scope.selectedPhoto = '../img/puppy1.jpg';

  // //api key
  // $scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyB5uWq_OelNUbXyUKUhr23Tj3enH6tqQfI"
  // //
  // //google map
  // NgMap.getMap().then(function(map) {
  //   console.log(map.getCenter());
  //   console.log('markers', map.markers);
  //   console.log('shapes', map.shapes);
  // });

  //functions
  $scope.changeSelectedPhoto = function(url){
    $scope.selectedPhoto = url;
  }

})
