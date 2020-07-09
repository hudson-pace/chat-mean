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
io.on('connection', function(socket) {
	nameCounter++;
	var user = {
		username: 'anon_' + nameCounter
	}
	onlineUsers.push(user);
	console.log('user connected: ' + user.username);
	io.emit('login', user.username);

	socket.on('chat message', function(msg) {
		msg.from = user.username;
		msg.id = idCounter;
		idCounter++;
		io.emit('chat message', msg);
	});

	socket.on('disconnect', function() {
		console.log('user disconnected.');
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
});

http.listen(3000, function() {
	console.log('listening on port 3000...');
});
