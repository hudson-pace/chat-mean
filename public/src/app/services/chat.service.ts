import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ChatMessage } from '../models/chat-message';
import { GameUpdate } from '../models/game-update';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    constructor(private socket: Socket, private authenticationService: AuthenticationService) {
        this.authenticationService.user.subscribe(x => {
            if (x && x.jwtToken) {
                this.socket.emit('authenticate', x.jwtToken);
            }
        });
    }

    send(event, payload) {
        if (payload) {
            this.socket.emit(event, payload);
        }
        else {
            this.socket.emit(event);
        }
    }

    receiveMessages() {
        return this.socket.fromEvent<ChatMessage>('chat message');
    }
    receiveNotices() {
        return this.socket.fromEvent<ChatMessage>('notice');
    }
    receiveGameUpdates() {
        return this.socket.fromEvent<GameUpdate>('game');
    }
}