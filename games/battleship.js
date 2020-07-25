module.exports = updateBattleship;

var battleshipQueue = [];
function updateBattleship(update, user, io) {
    switch(update.action) {
        case 'join_queue':
            user.queue = battleshipQueue;
            battleshipQueue.push(user);
            if (battleshipQueue.length > 1) {
                createGame(battleshipQueue.splice(0, 1)[0], battleshipQueue.splice(0, 1)[0], io);
            }
            break;
        case 'leave_queue':
            if (user.queue) {
                user.queue.splice(user.queue.indexOf(user), 1);
                user.queue = undefined;
            }
            break;
        case 'ready':
            setUserIsReady(user, io);
            break;
        case 'attack':
        case 'attack_response':
        case 'game_over':
            forwardUpdateToOpponent(user, io, update);
            break;
        
        
    }
}

function createGame(user_1, user_2, io) {
    let game = {
        game: 'battleship',
        players: [user_1, user_2],
        ready: 0,
        turn: undefined
    }
    user_1.game = game;
    user_2.game = game;
    user_1.queue = undefined;
    user_2.queue = undefined;
    user_1.opponent = user_2;
    user_2.opponent = user_1;
    let response = {
        game: 'battleship',
        action: 'matched',
        data: undefined
    }
    io.to(user_1.id).emit('game', response);
    io.to(user_2.id).emit('game', response);
}

function setUserIsReady(user, io) {
    user.game.ready++;
    if (user.game.ready === 2) {
        user.game.ready = 0;
        let update = {
            game: 'battleship',
            action: 'start',
            data: {
                turn: false
            }
        }
        io.to(user.id).emit('game', update);
        update.data.turn = true;
        io.to(user.opponent.id).emit('game', update);
    }
}

function forwardUpdateToOpponent(user, io, update) {
    io.to(user.opponent.id).emit('game', update);
}