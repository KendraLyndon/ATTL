var app = angular.module('app', ['ngRoute']);

app.config(function($stateProvider, $locationProvider) {
  $stateProvider
    .state('index', {
      url: "/",
      views: {
        "home": { templateUrl: "partials/home.html" },
        "news": { templateUrl: "partials/news.html" },
        "about": { templateUrl: "partials/about.html"},
        "tickets": { templateUrl: "partials/tickets.html" },
        "contact": { templateUrl: "partials/contact.html" }
      }
    })
    $locationProvider.html5Mode(true);
});
