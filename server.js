const express = require('express');
const app = express();
const httpServer = require('http').createServer(app);
const https = require('https');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const errorHandler = require('./middleware/error-handler');
const redirectToHttps = require('./middleware/redirect-to-https');
const { secret } = require('./config');
const { nextTick, disconnect } = require('process');
const db = require('./helpers/db');
const updateBattleship = require('./games/battleship');
const updateMoveAround = require('./games/move-around');
const updatePong = require('./games/pong');
const config = require('./config');
var httpsServer, io;

if (config.environment === 'production') {
	options = {
		key: fs.readFileSync('/etc/letsencrypt/live/hudsonotron.com/privkey.pem'),
		cert: fs.readFileSync('/etc/letsencrypt/live/hudsonotron.com/fullchain.pem')
	};
	httpsServer = https.createServer(options, app);
	io = require('socket.io')(httpsServer);
}
else {
	io = require('socket.io')(httpServer);
}

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({origin: (origin, callback) => callback(null, true), credentials: true}));
app.use(redirectToHttps);
app.use(express.static(path.join(__dirname, 'public', 'dist', 'ChatApp')));
app.use('/api/users', require('./users/users.controller'));
app.use('/api/posts', require('./posts/posts.controller'));
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
		socket: socket,
		game: undefined,
		queue: undefined,
		opponent: undefined,
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
		if (user.game) {
			let update = {
				game: undefined,
				action: 'leave',
				data: undefined
			}
			switch (user.game.game) {
				case 'battleship':
					updateBattleship(update, user, io);
					break;
				case 'move-around':
					updateMoveAround(update, user, io);
					break;
				case 'pong':
					updatePong(update, user, io);
					break;
			}
		}
	});

	socket.on('logout', function() {
		console.log(user.username + ' logged out.');
		user.username = 'anon_' + nameCounter;
	})
	
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

	socket.on('game', function(update) {
		switch(update.game) {
			case 'battleship':
				updateBattleship(update, user, io);
				break;
			case 'move-around':
				updateMoveAround(update, user, io);
				break;
			case 'pong':
				updatePong(update, user, io);
				break;
		}
	});
});

httpServer.listen(3000, function() {
	console.log('listening to http on port 3000')
})
if (config.environment === "production") {
	httpsServer.listen(3001, function() {
		console.log('listening to https on port 3001...');
	});
}