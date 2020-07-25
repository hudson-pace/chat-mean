var express = require('express');
var app = express();
var http = require('http').createServer(app);
var path = require('path');
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var errorHandler = require('./middleware/error-handler');
var { secret } = require('./config/database');
const { nextTick } = require('process');
var db = require('./helpers/db');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({origin: (origin, callback) => callback(null, true), credentials: true}));
app.use(express.static(path.join(__dirname, 'public', 'dist', 'ChatApp')));
app.use('/users', require('./users/users.controller'));
app.use(errorHandler);

app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname, 'public', 'dist', 'ChatApp', 'index.html'));
});

var onlineUsers = [];
var nameCounter = 0;
var idCounter = 0;
var chatroomCounter = 0;
var chatrooms = [];
var publicRoom = {
	id: 'public',
	members: {}
}
var battleshipQueue = [];
chatrooms.push(publicRoom);

io.on('connection', function(socket) {
	nameCounter++;
	var user = {
		username: 'anon_' + nameCounter,
		current_room: publicRoom,
		allowed_rooms: [publicRoom],
		id: socket.id,
		game: undefined,
		queue: undefined
	}
	onlineUsers.push(user);
	console.log('user connected: ' + user.username);
	socket.join(user.current_room.id);
	io.emit('login', user.username);

	socket.on('chat message', function(msg) {
		msg.from = user.username;
		msg.id = idCounter;
		idCounter++;
		io.to(user.current_room.id).emit('chat message', msg);
	});

	socket.on('disconnect', function() {
		console.log('user disconnected.');
		if (user.queue) {
			user.queue.splice(user.queue.indexOf(user), 1);
		}
		onlineUsers.splice(onlineUsers.indexOf(user), 1);
	});
	
	socket.on('authenticate', function(token) {
		jwt.verify(token, secret, async function(err, decodedToken) {
			if (err) {
				console.log('auth error');
			}
			var newUser = await db.User.findById(decodedToken.id);
			console.log(user.username + ' has signed in as ' + newUser.username + '.');
			user.username = newUser.username;
		});
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
		msg = {
			id: idCounter,
			text: onlineUsers.map(x => x.username).join(' '),
			from: 'server'
		}
		idCounter++;
		socket.emit('notice', msg);
	});

	socket.on('create_room', function() {
		var room = {
			id: chatroomCounter.toString()
		};
		chatroomCounter++;
		socket.leave(user.current_room.id);
		user.current_room = room;
		user.allowed_rooms.push(room);
		socket.join(room.id);

		msg = {
			id: idCounter,
			text: 'new room created with id ' + room.id,
			from: 'server'
		}
		socket.emit('notice', msg);
	});

	socket.on('invite_to_room', function(userToInvite) {
		console.log(userToInvite + ' has been added to ' + user.current_room.id + '.');
		msg = {
			id: idCounter,
			text: user.username + ' has added you to ' + user.current_room.id + '.',
			from: 'server'
		}
		for (let i = 0; i < onlineUsers.length; i++) {
			if (onlineUsers[i].username === userToInvite) {
				onlineUsers[i].allowed_rooms.push(user.current_room);
				socket.to(onlineUsers[i].id).emit('notice', msg);
				break;
			}
		}
	});

	socket.on('join_room', function(roomName) {
		for (let i = 0; i < user.allowed_rooms.length; i++) {
			if (user.allowed_rooms[i].id === roomName) {
				socket.leave(user.current_room.id);
				user.current_room = user.allowed_rooms[i];
				socket.join(roomName);
				break;
			}
		}
	});
	socket.on('list_rooms', function() {
		msg = {
			id: idCounter,
			text: user.allowed_rooms.map(x => x.id).join(' '),
			from: 'server'
		}
		socket.emit('notice', msg);
	});
	socket.on('get_current_room', function() {
		msg = {
			id: idCounter,
			text: user.current_room.id,
			from: 'server'
		}
		socket.emit('notice', msg);
	});

	socket.on('battleship_join_queue', function() {
		user.queue = battleshipQueue;
		battleshipQueue.push(user);
		if (battleshipQueue.length > 1) {
			let user_1 = battleshipQueue.splice(0, 1)[0];
			let user_2 = battleshipQueue.splice(0, 1)[0];
			let game = {
				game: 'battleship',
				players: [user_1, user_2],
				ready: 0,
				boards: [],
				turn: undefined
			}
			user_1.game = game;
			user_2.game = game;
			let update = {
				game: 'battleship',
				action: 'matched',
				data: undefined
			}
			user_1.queue = undefined;
			user_2.queue = undefined;
			socket.to(user_1.id).emit('game', update);
			socket.to(user_2.id).emit('game', update);
			socket.emit('game', update);
		}
	});
	socket.on('battleship_leave_queue', function() {
		if (user.queue) {
			user.queue.splice(user.queue.indexOf(user), 1);
			user.queue = undefined;
		}
	});
	socket.on('battleship_ready', function() {
		user.game.ready++;
		if (user.game.ready === 2) {
			user.game.ready = 0;
			let update = {
				game: 'battleship',
				action: 'start',
				data: {
					turn: true
				}
			}
			socket.to(user.game.players[0].id).emit('game', update);
			socket.to(user.game.players[1].id).emit('game', update);
			update.data.turn = false;
			socket.emit('game', update);
		}
	});
	socket.on('battleship_attack', function(coordinates) {
		let update = {
			game: 'battleship',
			action: 'attack',
			data: {
				coordinates: coordinates
			}
		}
		socket.to(user.game.players[0].id).emit('game', update);
		socket.to(user.game.players[1].id).emit('game', update);
	});
	socket.on('battleship_attack_response', function(response) {
		let update = {
			game: 'battleship',
			action: 'attack_response',
			data: {
				response: response
			}
		}
		socket.to(user.game.players[0].id).emit('game', update);
		socket.to(user.game.players[1].id).emit('game', update);
	});
	socket.on('battleship_lost', function() {
		let update = {
			game: 'battleship',
			action: 'won',
			data: {}
		}
		socket.to(user.game.players[0].id).emit('game', update);
		socket.to(user.game.players[1].id).emit('game', update);
	});
});

http.listen(3000, function() {
	console.log('listening on port 3000...');
});
