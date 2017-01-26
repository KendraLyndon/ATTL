var attlApp = angular.module('attlApp', [require('angular-route'),
                                        require('ngmap')]);

var HomeController = require('./controllers/HomeController');
var AboutController = require('./controllers/AboutController');
var NewsController = require('./controllers/Newscontroller');

attlApp.config(function($routeProvider, $locationProvider) {

  $routeProvider
    .when('/', {
      templateUrl: 'app/partials/home.html',
      controller: 'HomeController',
      resolve: HomeController.resolve
    })
    .when('/about', {
      templateUrl: 'app/partials/about.html',
      controller: 'AboutController',
      resolve: AboutController.resolve
    })
    .when('/news', {
      templateUrl: 'app/partials/news.html',
      controller: 'NewsController',
      resolve: NewsController.resolve
    })
    .when('/contact', {
      templateUrl: 'app/partials/contact.html'
    });

  $locationProvider.html5Mode(true);
});

module.exports = attlApp;
