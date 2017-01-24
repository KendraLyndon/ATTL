var attlApp = angular.module('attlApp', [require('angular-route'), require('ngmap')]);
var HomeController = require('./controllers/HomeController');

attlApp.config(function($routeProvider, $locationProvider) {

  $routeProvider
    .when('/', {
      templateUrl: 'app/partials/home.html',
      controller: 'HomeController',
      resolve: HomeController.resolve
    })
    .when('/about', {
      templateUrl: 'app/partials/about.html'
    })
    .when('/news', {
      templateUrl: 'app/partials/news.html'
    })
    .when('/tickets', {
      templateUrl: 'app/partials/tickets.html'
    })
    .when('/contact', {
      templateUrl: 'app/partials/contact.html'
    });

  $locationProvider.html5Mode(true);
});

module.exports = attlApp;
