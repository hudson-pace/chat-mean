angular.module('chatApp').config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: 'home.html'
        })
        .when('/login', {
            templateUrl: 'login.html'
        })
        .otherwise('/home');

        // use the html5 history api
        $locationProvider.html5Mode(true);
});