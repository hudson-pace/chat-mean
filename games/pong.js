const { update } = require("../users/user.model");

module.exports = updatePong;

var waitingUser;
function updatePong(update, user, io) {
    switch(update.action) {
        case 'join':
            if (!waitingUser) {
                waitingUser = user;
                user.game = {
                    game: 'pong'
                }
            }
            else {
                user.game = waitingUser.game;
                startGame(user, waitingUser, io);
                waitingUser = undefined;
            }
            break;
        case 'leave':
            if (user === waitingUser) {
                user.game = undefined;
                waitingUser = undefined;
            }
            else {
                leaveGame(user, io);
            }
            break;
        case 'move':
        case 'hit':
            io.to(user.opponent.id).emit('game', update);
            break;
        case 'miss':
            resetBall(user, user.opponent, io);
            break;
    }
}

function startGame(user_1, user_2, io) {
    user_1.opponent = user_2;
    user_2.opponent = user_1;
    let response = {
        game: 'pong',
        action: 'matched',
        data: {
            ball: getRandomBall()
        },
    }
    io.to(user_1.id).emit('game', response);
    response.data.ball.dy *= -1;
    io.to(user_2.id).emit('game', response);
}

function leaveGame(user, io) {
    let response = {
        game: 'pong',
        action: 'disconnected',
        data: undefined
    }
    io.to(user.opponent.id).emit('game', response);
    user.opponent.opponent = undefined;
    user.opponent.game = undefined;
    user.opponent = undefined;
    user.game = undefined;
}
function resetBall(loser, winner, io) {
    let response = {
        game: 'pong',
        action: 'reset',
        data: {
            ball: getRandomBall(),
            win: false,
        }
    };
    io.to(loser.id).emit('game', response);
    response.data.ball.dy *= -1;
    response.data.win = true;
    io.to(winner.id).emit('game', response);
}
function getRandomBall() {
    let direction = Math.floor(Math.random() * 2);
    if (direction === 0) {
        direction = -1;
    }
    return {
        dx: (Math.random() * 3) - 1.5,
        dy: direction
    }
}