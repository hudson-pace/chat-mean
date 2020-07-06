import { Component, OnInit } from '@angular/core';

import { ChatService } from '../services/chat.service'
import { AuthenticationService } from '../services/authentication.service'

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messages = [];
  username = '';
  message = '';
  constructor(private chatService: ChatService, private authenticationService: AuthenticationService) {
    this.authenticationService.user.subscribe(x => {
      if (x) {
        this.username = x.username;
      }
    });

    this.chatService.receiveMessages().subscribe(x => this.messages.push(x));
  }

  ngOnInit(): void {
  }

  send() {
    console.log("here we go: " + this.message);
    this.chatService.sendMessage({ id: 0, text: this.message, from: this.username });
    this.message = '';
  }
}
