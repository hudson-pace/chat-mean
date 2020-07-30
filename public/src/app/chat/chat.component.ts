import { Component, OnInit } from '@angular/core';

import { ChatService } from '../services/chat.service'
import { AuthenticationService } from '../services/authentication.service'
import { Subscription } from 'rxjs';
import { UrlHandlingStrategy } from '@angular/router';

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
    this.subscription.add(this.authenticationService.getUserSubject().subscribe(x => {
      if (x) {
        this.username = x.username;
      }
    }));

    this.subscription.add(this.chatService.receiveMessages().subscribe(x => this.messages.push(x)));
    this.subscription.add(this.chatService.receiveNotices().subscribe(x => this.messages.push(x)));
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  send() {
    if (this.message.startsWith('/')) {
      var command = this.message.split(' ');
      switch (command[0]) {
        case '/list':
          this.chatService.send('list_users', null);
          break;
        case '/createRoom':
          this.chatService.send('create_room', null);
          break;
        case '/invite':
          if (command.length !== 2) {
            this.messages.push({
              id: 0,
              from: 'USAGE',
              text: '/invite [name]'
            });
          }
          else {
            this.chatService.send('invite_to_room', command[1]);
          }
          break;
        case '/join':
          if (command.length !== 2) {
            this.messages.push({
              id: 0,
              from: 'USAGE',
              text: '/join [room]'
            });
          }
          else {
            this.chatService.send('join_room', command[1]);
          }
          break;
        case '/rooms':
          this.chatService.send('list_rooms', null);
          break;
        case '/room':
          this.chatService.send('get_current_room', null);
          break;
        default:
          this.messages.push({
            id: 0,
            from: 'ERROR',
            text: 'unknown command'
          });
          break;
      }
    }
    else {
      this.chatService.send('chat message', { id: 0, text: this.message, from: this.username });
    }
    this.message = '';
  }
}
