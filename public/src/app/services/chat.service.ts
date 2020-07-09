import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ChatMessage } from '../models/chat-message';
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

    sendMessage(message: ChatMessage) {
        this.socket.emit('chat message', message)
    }

    receiveMessages() {
        return this.socket.fromEvent<ChatMessage>('chat message');
    }
}