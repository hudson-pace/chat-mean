var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket) {
	console.log('user connected.');
	socket.on('chat message', function(msg) {
		io.emit('chat message', msg);
	});
	socket.on('disconnect', function() {
		console.log('user disconnected.');
	});
});

http.listen(3000, function() {
	console.log('listening on localhost:3000...');
});
