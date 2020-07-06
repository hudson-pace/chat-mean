import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ChatMessage } from '../models/chat-message';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    constructor(private socket: Socket) {}

    sendMessage(message: ChatMessage) {
        this.socket.emit('chat message', message)
    }

    receiveMessages() {
        return this.socket.fromEvent<ChatMessage>('chat message');
    }
}