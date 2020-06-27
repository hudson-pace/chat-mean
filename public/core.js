var chatApp = angular.module("chatApp", ['ngRoute']);
var socket = io();
chatApp.controller("mainController", function($scope, $timeout) {
    var chatScrollBox = document.getElementById("message-list");
    var messageCounter = 0;
    $scope.messages = [];
    $scope.textStyle = {};
    $scope.userName = '';
    $scope.message = '';
    $scope.send = function() {
        if ($scope.message[0] === '/') {
            command = $scope.message.split(' ');
            switch (command[0]) {
                case '/list':
                    if (command.length === 1) {
                        socket.emit('list_users');
                    }
                    else {
                        sendNotice('usage: /list');
                    }
                    break;
                case '/setcolor':
                    if (command.length === 2)
                    {
                        var s = new Option().style;
                        s.color = command[1]
                        if (s.color === command[1]) {
                            $scope.textStyle.color = command[1];
                            sendNotice('text color set to ' + command[1] + '.');
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
                        if (command[1].startsWith('anon_')) {
                            sendNotice('names beginning with "anon_" are reserved.');
                        }
                        else {
                            socket.emit('change_name', command[1]);
                        }
                    }
                    else {
                        sendNotice('usage: /setname [name]');
                    }
                    break;


                case '/help':
                    sendNotice('available commands: help, list, setcolor, setname')
                    break;
                default:
                    sendNotice('unknown command. use /help for a list of commands.')
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
        chatScrollBox.scrollTop = chatScrollBox.scrollHeight;
    });
    socket.on('login', function(msg) {
        if ($scope.userName === '') {
            $scope.userName = msg;
        }
        sendNotice(msg + ' connected');
    });
    socket.on('change_name', function(res) {
        if (res.taken) {
            sendNotice('the name "' + res.username + '" is taken.');
        }
        else {
            $scope.userName = res.username;
            sendNotice('name set to ' + $scope.userName + '.');
        }
    });

    socket.on('list_users', function(res) {
        userList = 'users: ';
        for (let i = 0; i < res.length; i++) {
            userList += res[i].username + ' ';
        }
        sendNotice(userList);
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
        $timeout(function() {
            chatScrollBox.scrollTop = chatScrollBox.scrollHeight;
        });
    }
});