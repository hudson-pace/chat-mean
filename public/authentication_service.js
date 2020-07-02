angular.module('chatApp').factory('AuthenticationService', 
    ['$http', '$rootScope', '$timeout',
    function($http, $rootScope, $timeout) {
        var service = {};

        service.Login = function(username, password, callback) {
            // dummy auth for testing, simulate api call with $timeout
            $timeout(function() {
                var response = {success: username === 'test' && password === 'test'};
                if (!response.success) {
                    response.message = 'username or password is incorrect';
                }
                callback(response);
            }, 1000);
        };

        service.SetCredentials = function(username, password) {
            var authData = username + ':' + password;
            $rootScope.globals = {
                currentUser: {
                    username: username,
                    authData: authData
                }
            };
            $http.defaults.headers.common['Authorization'] = 'Basic ' + authData;
        };

        service.ClearCredentials = function() {
            $rootScope.globals = {};
            $http.defaults.headers.common.Authorization = 'Basic';
        };

        return service;
    }])