angular.module('chatApp').config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: 'home.html'
        })
        .when('/login', {
            templateUrl: 'authentication/views/login.html'
        })
        .when('/register', {
            templateUrl: 'register.html'
        })
        .otherwise('/home');

        // use the html5 history api
        $locationProvider.html5Mode(true);
});