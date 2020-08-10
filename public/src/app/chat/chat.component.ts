import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewChecked } from '@angular/core';

import { ChatService } from '../services/chat.service'
import { AuthenticationService } from '../services/authentication.service'
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  private subscription: Subscription = new Subscription();
  @ViewChild('messageList') private messageList: ElementRef;
  active: boolean = false;
  newMessages: boolean = false;
  manualScrolling: boolean = false;
  inputHeight = 1;
  messages = [];
  oldMessages = [];
  username = '';
  message = new FormControl('');
  constructor(private chatService: ChatService, private authenticationService: AuthenticationService) {
    this.subscription.add(this.authenticationService.getUserSubject().subscribe(x => {
      if (x) {
        this.username = x.username;
      }
      else {
        this.username = '';
      }
    }));

    this.subscription.add(this.chatService.receiveMessages().subscribe(x => this.addToMessageList(x)));
    this.subscription.add(this.chatService.receiveNotices().subscribe(x => this.addToMessageList(x)));
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterViewChecked(): void {
    if (this.messages.length !== this.oldMessages.length && !this.manualScrolling) {
      this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight - this.messageList.nativeElement.clientHeight;
      this.oldMessages = this.messages.slice();
    }
  }

  send() {
    if (this.message.value.startsWith('/')) {
      var command = this.message.value.split(' ');
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
      this.chatService.send('chat message', { id: 0, text: this.message.value, from: this.username });
    }
    this.message.setValue('');
  }
  onPressEnter(event) {
    event.preventDefault();
    this.inputHeight = 1;
    this.send();
  }
  changeText(event) {
    this.inputHeight = event.target.scrollHeight;
    if (event.target.offsetHeight > event.target.scrollHeight) {
      this.inputHeight -= 18;
    }
  }
  toggleActive() {
    this.active = !this.active;
    this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight - this.messageList.nativeElement.clientHeight;
    if (this.active) {
      this.newMessages = false;
    }
  }
  onScroll() {
    if (this.messageList.nativeElement.scrollTop === this.messageList.nativeElement.scrollHeight - this.messageList.nativeElement.clientHeight) {
      this.manualScrolling = false;
      this.newMessages = false;
    }
    else {
      this.manualScrolling = true;
    }
  }
  addToMessageList(message): void {
    this.messages.push(message);
    if (!this.active || this.manualScrolling) {
      this.newMessages = true;
    }
  }
}
