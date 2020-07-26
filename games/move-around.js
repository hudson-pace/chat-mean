module.exports = updateMoveAround;

const room = {
    id: 'move-around'
}
var players = []
function updateMoveAround(update, user, io) {
    let response;
    switch(update.action) {
        case 'move':
            let player;
            for (let i = 0; i < players.length; i++) {
                if (players[i].name === user.username) {
                    player = players[i];
                    break;
                }
            }
            player.x = update.data.x;
            player.y = update.data.y;
            response = {
                game: 'move-around',
                action: 'update-position',
                data: player
            }
            user.socket.to(room.id).emit('game', response);
            break;
        case 'join':
            user.socket.join(room.id);
            response = {
                game: 'move-around',
                action: 'players',
                data: players
            }
            user.socket.emit('game', response);
            let newPlayer = {
                name: user.username,
                x: update.data.x,
                y: update.data.y
            }
            players.push(newPlayer);
            response = {
                game: 'move-around',
                action: 'new-player',
                data: newPlayer
            }
            user.socket.to(room.id).emit('game', response);
            break;
        case 'leave':
            leaveGame(user);
            break;
    }
}

function leaveGame(user) {
    user.socket.leave(room.id);
    let index;
    for (let i = 0; i < players.length; i++) {
        if (players[i].name === user.username) {
            index = i;
            break;
        }
    }
    players.splice(index, 1);
    let update = {
        game: 'move-around',
        action: 'player-disconnected',
        data: user.username
    }
    user.socket.to(room.id).emit('game', update);
}