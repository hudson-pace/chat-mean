var chatApp = angular.module("chatApp", []);
var socket = io();
chatApp.controller("mainController", function($scope) {
    var messageCounter = 0;
    $scope.messages = [];
    $scope.textStyle = {};
    $scope.send = function() {
        if ($scope.message[0] === '/') {
            command = $scope.message.split(' ');
            switch (command[0]) {
                case '/changecolor':
                    var s = new Option().style;
                    s.color = command[1]
                    if (s.color === command[1]) {
                        $scope.textStyle.color = command[1];
                    }
                    break;
            }
        }
        else {
            msg = {
                text: $scope.message,
                style: $scope.textStyle
            }
            socket.emit('chat message', msg);
        }
        $scope.message = "";
    };
    socket.on('chat message', function(msg) {
        messageCounter++;
        $scope.$apply(function() {
            $scope.messages.push(
                {
                    index: messageCounter,
                    message: msg.text,
                    style: msg.style
                }
            );
        });
    });
});