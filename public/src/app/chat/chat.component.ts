import { Component, OnInit } from '@angular/core';

import { ChatService } from '../services/chat.service'
import { AuthenticationService } from '../services/authentication.service'
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  private subscription: Subscription = new Subscription();
  messages = [];
  username = '';
  message = '';
  constructor(private chatService: ChatService, private authenticationService: AuthenticationService) {
    this.subscription.add(this.authenticationService.user.subscribe(x => {
      if (x) {
        this.username = x.username;
      }
    }));

    this.subscription.add(this.chatService.receiveMessages().subscribe(x => this.messages.push(x)));
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  send() {
    this.chatService.sendMessage({ id: 0, text: this.message, from: this.username });
    this.message = '';
  }
}
