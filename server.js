var express = require('express');
var app = express();
var database = require('./config/database');
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

app.get('*', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

var onlineUsers = [];
var idCounter = 0;
io.on('connection', function(socket) {
	idCounter++;
	var user = {
		id: idCounter,
		username: 'anon_' + idCounter
	}
	onlineUsers.push(user);
	console.log('user connected: ' + user.username);
	io.emit('login', user.username);

	socket.on('chat message', function(msg) {
		io.emit('chat message', msg);
	});

	socket.on('disconnect', function() {
		console.log('user disconnected.');
		onlineUsers.splice(onlineUsers.indexOf(user), 1);
	});

	socket.on('change_name', function(name) {
		let taken = false;
		for (let i = 0; i < onlineUsers.length; i++) {
			if (onlineUsers[i].username === name) {
				taken = true;
				break;
			}
		}
		if (!taken) {
			user.username = name;
		}
		socket.emit('change_name', {
			taken: taken,
			username: name
		});
	});
	socket.on('list_users', function() {
		socket.emit('list_users', onlineUsers);
	});
});

http.listen(3000, function() {
	console.log('listening on localhost:3000...');
});
