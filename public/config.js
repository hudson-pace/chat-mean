angular.module('chatApp')
.config(function($routeProvider, $locationProvider) {
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
})
.run(['$rootScope', '$location', '$cookieStore', '$http', function($rootScope, $location, $cookieStore, $http) {
    $rootScope.globals = $cookieStore.get('globals') || {};
    if ($rootScope.globals.currentUser) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata;
    }
    $rootScope.$on('$locationChangeStart', function(event, next, current) {
        if ($location.path() === '/login' && $rootScope.globals.currentUser) {
            $location.path('/home');
        }
    })
}]);