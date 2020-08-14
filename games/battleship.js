const battleshipQueue = [];
function updateBattleship(update, user, io) {
  switch (update.action) {
    case 'join_queue':
      user.queue = battleshipQueue;
      battleshipQueue.push(user);
      if (battleshipQueue.length > 1) {
        createGame(battleshipQueue.splice(0, 1)[0], battleshipQueue.splice(0, 1)[0], io);
      }
      break;
    case 'leave':
      leaveQueue(user);
      leaveGame(user, io);
      break;
    case 'ready':
      setUserIsReady(user, io);
      break;
    case 'attack':
    case 'attack_response':
    case 'game_over':
      forwardUpdateToOpponent(user, io, update);
      break;
    default:
      break;
  }
}

function leaveQueue(user) {
  if (user.queue) {
    user.queue.splice(user.queue.indexOf(user), 1);
    user.queue = undefined;
  }
}

function createGame(user_1, user_2, io) {
  const game = {
    game: 'battleship',
    players: [user_1, user_2],
    ready: 0,
    turn: undefined,
  };
  user_1.game = game;
  user_2.game = game;
  user_1.queue = undefined;
  user_2.queue = undefined;
  user_1.opponent = user_2;
  user_2.opponent = user_1;
  const response = {
    game: 'battleship',
    action: 'matched',
    data: undefined,
  };
  io.to(user_1.id).emit('game', response);
  io.to(user_2.id).emit('game', response);
}

function leaveGame(user, io) {
  if (user.game) {
    const update = {
      game: 'battleship',
      action: 'disconnected',
      data: undefined,
    };
    io.to(user.opponent.id).emit('game', update);
    user.opponent.opponent = undefined;
    user.opponent.game = undefined;
    user.opponent = undefined;
    user.game = undefined;
  }
}

function setUserIsReady(user, io) {
  const returnUser = user;
  returnUser.game.ready += 1;
  if (user.game.ready === 2) {
    returnUser.game.ready = 0;
    const update = {
      game: 'battleship',
      action: 'start',
      data: {
        turn: false,
      },
    };
    io.to(user.id).emit('game', update);
    update.data.turn = true;
    io.to(user.opponent.id).emit('game', update);
  }
}

function forwardUpdateToOpponent(user, io, update) {
  io.to(user.opponent.id).emit('game', update);
}

module.exports = updateBattleship;
