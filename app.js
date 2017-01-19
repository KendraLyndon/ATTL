var app = angular.module('attl-app', ['ngRoute']);

app.config(function($routeProvider, $locationProvider) {

  $routeProvider
    .when('/', {
      templateUrl: 'partials/home.html',
      controller: 'controllers/HomeController'
    })
    .when('/about', {
      templateUrl: 'partials/about.html'
    })
    .when('/news', {
      templateUrl: 'partials/news.html',
      controller: 'controllers/NewsController'
    })
    .when('/tickets', {
      templateUrl: 'partials/tickets.html'
    })
    .when('/contact', {
      templateUrl: 'partials/contact.html'
    })

  $locationProvider.html5Mode(true);
});
