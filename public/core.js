var chatApp = angular.module("chatApp", []);
var socket = io();
chatApp.controller("mainController", function($scope, $timeout) {
    var messageCounter = 0;
    $scope.messages = [];
    $scope.textStyle = {};
    $scope.userName = '';
    $scope.send = function() {
        if ($scope.message[0] === '/') {
            command = $scope.message.split(' ');
            switch (command[0]) {
                case '/setcolor':
                    if (command.length === 2)
                    {
                        var s = new Option().style;
                        s.color = command[1]
                        if (s.color === command[1]) {
                            $scope.textStyle.color = command[1];
                            sendNotice('text color set to ' + command[1]);
                        }
                        else {
                            sendNotice(command[1] + ' is not a valid color.');
                        }
                    }
                    else {
                        sendNotice('usage: /setcolor [color]');
                    }
                    break;
                case '/setname':
                    if (command.length === 2) {
                        $scope.userName = command[1];
                    }
                    else {
                        sendNotice('usage: /setname [name]');
                    }
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
        sendNotice(msg + ' connected');
    });

    function sendNotice(msg) {
        messageCounter++;
        $timeout(function() {
            $scope.messages.push(
                {
                    index: messageCounter,
                    text: msg,
                    style: {'background-color': '#eb877c'},
                    from: 'system'
                }
            );
        });
    }
});