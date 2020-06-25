var chatApp = angular.module("chatApp", []);
var socket = io();
chatApp.controller("mainController", function($scope) {
    var messageCounter = 0;
    $scope.messages = [];
    $scope.textStyle = {};
    $scope.userName = '';
    $scope.send = function() {
        if ($scope.message[0] === '/') {
            command = $scope.message.split(' ');
            switch (command[0]) {
                case '/setcolor':
                    var s = new Option().style;
                    s.color = command[1]
                    if (s.color === command[1]) {
                        $scope.textStyle.color = command[1];
                    }
                    break;
                case '/setname':
                    $scope.userName = command[1];
                    break;
            }
        }
        else {
            msg = {
                text: $scope.message,
                style: $scope.textStyle,
                from: $scope.userName
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
                    text: msg.text,
                    style: msg.style,
                    from: msg.from
                }
            );
        });
    });
    socket.on('notice', function(msg) {
        if ($scope.userName === '') {
            $scope.userName = msg;
        }
        messageCounter++;
        $scope.$apply(function() {
            $scope.messages.push(
                {
                    index: messageCounter,
                    text: msg + " connected",
                    style: {'background-color': '#eb877c'},
                    from: 'system'
                }
            )
        })
    });
});