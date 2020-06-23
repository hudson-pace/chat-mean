var chatApp = angular.module("chatApp", []);
var socket = io();
chatApp.controller("mainController", function($scope) {
    var messageCounter = 0;
    $scope.messages = [];
    $scope.send = function() {
        socket.emit('chat message', $scope.message);
        $scope.message = "";
    };
    socket.on('chat message', function(msg) {
        messageCounter++;
        $scope.$apply(function() {
            $scope.messages.push(
                {
                    index: messageCounter,
                    message: msg
                }
            );
        });
    });
});