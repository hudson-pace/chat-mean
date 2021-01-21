const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const socketIo = require('socket.io');
const errorHandler = require('./middleware/error-handler');
const db = require('./helpers/db');
const updateBattleship = require('./games/battleship');
const updateMoveAround = require('./games/move-around');
const updatePong = require('./games/pong');
const config = require('./config');
const usersController = require('./users/users.controller');

const app = express();

let server;

if (config.environment === 'production') {
  const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/hudsonotron.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/hudsonotron.com/fullchain.pem'),
  };
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}

const io = socketIo(server);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));
app.use('/users', usersController);
app.use(errorHandler);

let nameCounter = 0;
let idCounter = 0;
let chatroomCounter = 0;
const onlineUsers = [];
const publicRoom = {
  id: 'public',
  members: {},
};
const chatrooms = [];
chatrooms.push(publicRoom);

io.on('connection', (socket) => {
  nameCounter += 1;
  const user = {
    username: `anon_${nameCounter}`,
    current_room: publicRoom,
    allowed_rooms: [publicRoom],
    id: socket.id,
    socket,
    game: undefined,
    queue: undefined,
    opponent: undefined,
  };
  onlineUsers.push(user);
  console.log(`user connected: ${user.username}`);
  socket.join(user.current_room.id);
  io.emit('login', user.username);

  socket.on('chat message', (msg) => {
    const returnMessage = msg;
    returnMessage.from = user.username;
    returnMessage.id = idCounter;
    idCounter += 1;
    io.to(user.current_room.id).emit('chat message', returnMessage);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected.');
    if (user.game) {
      const update = {
        game: undefined,
        action: 'leave',
        data: undefined,
      };
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
        default:
          break;
      }
    }
  });

  socket.on('logout', () => {
    console.log(`${user.username} logged out.`);
    user.username = `anon_${nameCounter}`;
  });

  socket.on('authenticate', (token) => {
    jwt.verify(token, config.secret, async (err, decodedToken) => {
      if (err) {
        console.log('auth error');
      }
      const newUser = await db.User.findById(decodedToken.id);
      console.log(`${user.username} has signed in as ${newUser.username}.`);
      user.username = newUser.username;
    });
  });

  socket.on('change_name', (name) => {
    let taken = false;
    for (let i = 0; i < onlineUsers.length; i += 1) {
      if (onlineUsers[i].username === name) {
        taken = true;
        break;
      }
    }
    if (!taken) {
      user.username = name;
    }
    socket.emit('change_name', {
      taken,
      username: name,
    });
  });
  socket.on('list_users', () => {
    const msg = {
      id: idCounter,
      text: onlineUsers.map((x) => x.username).join(' '),
      from: 'server',
    };
    idCounter += 1;
    socket.emit('notice', msg);
  });

  socket.on('create_room', () => {
    const room = {
      id: chatroomCounter.toString(),
    };
    chatroomCounter += 1;
    socket.leave(user.current_room.id);
    user.current_room = room;
    user.allowed_rooms.push(room);
    socket.join(room.id);

    const msg = {
      id: idCounter,
      text: `new room created with id ${room.id}`,
      from: 'server',
    };
    socket.emit('notice', msg);
  });

  socket.on('invite_to_room', (userToInvite) => {
    console.log(`${userToInvite} has been added to ${user.current_room.id}.`);
    const msg = {
      id: idCounter,
      text: `${user.username} has added you to ${user.current_room.id}.`,
      from: 'server',
    };
    for (let i = 0; i < onlineUsers.length; i += 1) {
      if (onlineUsers[i].username === userToInvite) {
        onlineUsers[i].allowed_rooms.push(user.current_room);
        socket.to(onlineUsers[i].id).emit('notice', msg);
        break;
      }
    }
  });

  socket.on('join_room', (roomName) => {
    for (let i = 0; i < user.allowed_rooms.length; i += 1) {
      if (user.allowed_rooms[i].id === roomName) {
        socket.leave(user.current_room.id);
        user.current_room = user.allowed_rooms[i];
        socket.join(roomName);
        break;
      }
    }
  });
  socket.on('list_rooms', () => {
    const msg = {
      id: idCounter,
      text: user.allowed_rooms.map((x) => x.id).join(' '),
      from: 'server',
    };
    socket.emit('notice', msg);
  });
  socket.on('get_current_room', () => {
    const msg = {
      id: idCounter,
      text: user.current_room.id,
      from: 'server',
    };
    socket.emit('notice', msg);
  });

  socket.on('game', (update) => {
    switch (update.game) {
      case 'battleship':
        updateBattleship(update, user, io);
        break;
      case 'move-around':
        updateMoveAround(update, user, io);
        break;
      case 'pong':
        updatePong(update, user, io);
        break;
      default:
        break;
    }
  });
});

server.listen(config.port, () => console.log(`listening on port ${config.port}`));
