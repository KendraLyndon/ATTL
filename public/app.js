var attlApp = angular.module('attlApp', ['ngRoute']);

attlApp.config(function($routeProvider, $locationProvider) {

  $routeProvider
    .when('/', {
      templateUrl: 'partials/home.html',
      controller: 'HomeController'
    })
    .when('/about', {
      templateUrl: 'partials/about.html',
      controller: 'AboutController'
    })
    .when('/news', {
      templateUrl: 'partials/news.html',
      controller: 'NewsController'
    })
    .when('/contact', {
      templateUrl: 'partials/contact.html'
    })
    .otherwise('/', {
      redirectTo : '/'
    })

  $locationProvider.html5Mode(true);
});
