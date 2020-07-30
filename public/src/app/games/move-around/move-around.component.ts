import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { CONTEXT_NAME } from '@angular/compiler/src/render3/view/util';
import { ChatService } from './../../services/chat.service';
import { Subscription } from 'rxjs';
import { GameUpdate } from './../../models/game-update';

@Component({
  selector: 'app-move-around',
  templateUrl: './move-around.component.html',
  styleUrls: ['./move-around.component.css']
})
export class MoveAroundComponent implements OnInit, AfterViewInit {
  @ViewChild('gameCanvas', {static: false}) gameCanvas: ElementRef;
  context: CanvasRenderingContext2D;
  private subscription: Subscription = new Subscription();
  private x: number = 100;
  private y: number = 100;
  private dx: number = 0;
  private dy: number = 0;
  private players: any[] = [];
  private pressedKeys = {
    key65: false,
    key68: false,
    key83: false,
    key87: false
  }


  constructor(private chatService: ChatService) {
    this.subscription.add(this.chatService.receiveGameUpdates().subscribe(x => {
      if (x.game === 'move-around') {
        this.respondToServerEvent(x);
      }
    }));
    this.sendUpdate('join', { x: this.x, y: this.y });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.sendUpdate('leave', null);
  }

  ngAfterViewInit(): void {
    this.gameCanvas.nativeElement.width = this.gameCanvas.nativeElement.clientWidth;
    this.gameCanvas.nativeElement.height = this.gameCanvas.nativeElement.clientHeight;
    this.context = this.gameCanvas.nativeElement.getContext('2d');

    setInterval(this.update.bind(this), 10);
  }

  update() {
    this.dx = 0;
    this.dy = 0;
    if (this.pressedKeys.key65) {
      this.dx -= 3;
    }
    if (this.pressedKeys.key68) {
      this.dx += 3;
    }
    if (this.pressedKeys.key87) {
      this.dy -= 3;
    }
    if (this.pressedKeys.key83) {
      this.dy += 3;
    }
    if (this.dx !== 0 || this.dy !== 0) {
      let oldX = this.x;
      let oldY = this.y;
      this.x += this.dx;
      this.y += this.dy;
      if (this.x < 10) {
        this.x = 10;
      }
      else if (this.x > this.gameCanvas.nativeElement.width - 10) {
        this.x = this.gameCanvas.nativeElement.width - 10;
      }
      if (this.y < 10) {
        this.y = 10;
      }
      else if (this.y > this.gameCanvas.nativeElement.height - 10) {
        this.y = this.gameCanvas.nativeElement.height - 10;
      }
      if (oldX !== this.x || oldY !== this.y) {
        this.sendUpdate('move', { x: this.x, y: this.y });
      }
    }
    this.draw();
  }
  draw() {
    this.context.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
    for (let i = 0; i < this.players.length; i++) {
      this.context.fillStyle = "#DD9500"
      this.context.beginPath();
      this.context.arc(this.players[i].x, this.players[i].y, 10, 0, Math.PI*2);
      this.context.fill();
      this.context.closePath();
    }
    this.context.fillStyle = "#0095DD";
    this.context.beginPath();
    this.context.arc(this.x, this.y, 10, 0, Math.PI*2);
    this.context.fill();
    this.context.closePath();
    

  }

  onKeyDown(event: any) {
    if (this.pressedKeys['key' + event.keyCode] !== undefined) {
      this.pressedKeys['key' + event.keyCode] = true;
    }
  }
  onKeyUp(event: any) {
    if (this.pressedKeys['key' + event.keyCode] !== undefined) {
      this.pressedKeys['key' + event.keyCode] = false;
    }
  }
  onBlur() {
    this.pressedKeys.key65 = false;
    this.pressedKeys.key68 = false;
    this.pressedKeys.key83 = false;
    this.pressedKeys.key87 = false;
    this.dx = 0;
    this.dy = 0;
  }

  respondToServerEvent(update: GameUpdate) {
    switch (update.action) {
      case 'players':
        this.players = update.data;
        break;
      case 'update-position':
        for (let i = 0; i < this.players.length; i++) {
          if (this.players[i].name === update.data.name) {
            this.players[i].x = update.data.x;
            this.players[i].y = update.data.y;
            break;
          }
        }
        break;
      case 'new-player':
        this.players.push(update.data);
        break;
      case 'player-disconnected':
        let index;
        for (let i = 0; i < this.players.length; i++) {
          if (this.players[i].name === update.data) {
            index = i;
            break;
          }
        }
        this.players.splice(index, 1);
    }
  }
  sendUpdate(action: string, data: any) {
    let update = {
      game: 'move-around',
      action: action,
      data: data
    }
    this.chatService.send('game', update);
  }
}
