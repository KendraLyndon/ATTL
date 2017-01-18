angular.module('attl-app', ['ngRoute']);

angular.module('attl-app').config(function($routeProvider, $locationProvider) {

  $routeProvider
    .when('/', {
      templateUrl: 'partials/home.html'
    })
    .when('/about', {
      templateUrl: 'partials/about.html'
    })
    .when('/news', {
      templateUrl: 'partials/news.html'
    })
    .when('/tickets', {
      templateUrl: 'partials/tickets.html'
    })
    .when('/contact', {
      templateUrl: 'partials/contact.html'
    })

  $locationProvider.html5Mode(true);
});
