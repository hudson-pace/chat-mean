import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Subscription } from 'rxjs';
import { GameUpdate } from '../../models/game-update';

enum Phase {
  PlayerNumberChoice,
  MultiPlayerOptions,
  WaitingForMatch,
  MainGame,
  GameOver
}
enum Mode {
  SinglePlayer,
  LocalMultiPlayer,
  OnlineMultiPlayer
}

@Component({
  selector: 'app-pong',
  templateUrl: './pong.component.html',
  styleUrls: ['./pong.component.css']
})
export class PongComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', {static: false}) gameCanvas: ElementRef;
  Phase = Phase;
  Mode = Mode;
  playerNumOptions = ["SinglePlayer", "MultiPlayer"];
  multiPlayerOptions = ["Local", "Online"];
  gameOverOptions = ["Return"];
  gameTitle = "Pong";
  waitingText = "Waiting for a match...";
  gameOverText: string;
  gamePhase: Phase = Phase.PlayerNumberChoice;
  gameMode: Mode;

  private usingTouchControls: boolean = false;
  private touchTarget: number;
  private enemyTouchTarget: number;
  private updateInterval;
  private subscription: Subscription = new Subscription();
  private context: CanvasRenderingContext2D;
  private stepSize: number;
  private heightUnit: number;
  private width: number = 100;
  private height: number = 200;
  private countdown: number = 100;
  private pressedKeys = {
    key37: false,
    key39: false,
    key65: false,
    key68: false
  }
  private player = {
    x: 0,
    y: 0,
    dx: 0,
    oldDx: 0,
    width: 16,
    height: 4,
    score: 0,
    isWinner: false,
  }
  private enemy = {
    x: 0,
    y: 0,
    dx: 0,
    oldDx: 0,
    width: 16,
    height: 4,
    score: 0,
    isWinner: false,
  }
  private ball = {
    x: this.width / 2,
    y: this.height / 2,
    dx: 0,
    dy: 0,
    radius: 2,
    isMoving: false,
  }
  
  constructor(
    private chatService: ChatService,
  ) {
    this.subscription.add(chatService.receiveGameUpdates().subscribe(x => {
      if (x.game === 'pong') {
        this.respondToServerEvent(x);
      }
    }));
  }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    this.context = this.gameCanvas.nativeElement.getContext('2d');
  }
  ngOnDestroy(): void {
    if (this.gameMode === Mode.OnlineMultiPlayer) {
      this.sendGameUpdate('leave', undefined);
      this.endGame();
    }
  }


  onKeyDown(event: any) {
    if (this.pressedKeys['key' + event.keyCode] !== undefined) {
      this.usingTouchControls = false;
      this.pressedKeys['key' + event.keyCode] = true;
    }
  }
  onKeyUp(event: any) {
    if (this.pressedKeys['key' + event.keyCode] !== undefined) {
      this.pressedKeys['key' + event.keyCode] = false;
    }
  }

  calculateDx() {
    if (this.usingTouchControls) {
      if (this.touchTarget - 1 > this.player.x + (this.player.width / 2)) {
        this.player.dx = 1;
      }
      else if (this.touchTarget + 1 < this.player.x + (this.player.width / 2)) {
        this.player.dx = -1;
      }
      else {
        this.player.dx = 0;
      }
    }
    else {
      if (this.pressedKeys.key65) {
        if (this.pressedKeys.key68) {
          this.player.dx = 0;
        }
        else {
          this.player.dx = -1;
        }
      }
      else if (this.pressedKeys.key68) {
        this.player.dx = 1;
      }
      else {
        this.player.dx = 0;
      }
    }
  }

  onBlur() {
    this.pressedKeys.key65 = false;
    this.pressedKeys.key68 = false;
    this.player.dx = 0;
  }
  onResize() {
    this.gameCanvas.nativeElement.width = this.gameCanvas.nativeElement.clientWidth;
    this.gameCanvas.nativeElement.height = this.gameCanvas.nativeElement.clientHeight;
    this.stepSize = this.gameCanvas.nativeElement.width / this.width;
    this.heightUnit = this.gameCanvas.nativeElement.height / this.height;

    this.player.y = 200 - this.player.height * 5;
    this.enemy.y = this.enemy.height * 4;
  }
  onClickSinglePlayer() {
    this.gameMode = Mode.SinglePlayer;
    this.gamePhase = Phase.MainGame;
    this.startGame();
  }
  onClickMultiPlayer() {
    this.gamePhase = Phase.MultiPlayerOptions;
  }
  onClickLocalMultiPlayer() {
    this.gameMode = Mode.LocalMultiPlayer;
    this.gamePhase = Phase.MainGame;
    this.startGame();
  }
  onClickOnlineMultiPlayer() {
    this.gameMode = Mode.OnlineMultiPlayer;
    this.gamePhase = Phase.WaitingForMatch;
    this.sendGameUpdate('join', undefined);
  }
  onClickReturn() {
    this.gamePhase = Phase.PlayerNumberChoice;
    this.endGame();
    this.sendGameUpdate('leave', undefined);
  }
  onOptionChoice(event) {
    switch (event) {
      case "SinglePlayer":
        this.onClickSinglePlayer();
        break;
      case "MultiPlayer":
        this.onClickMultiPlayer();
        break;
      case "Local":
        this.onClickLocalMultiPlayer();
        break;
      case "Online":
        this.onClickOnlineMultiPlayer();
        break;
      case "Return":
        this.onClickReturn();
        break;
    }
  }
  onTouchStart(event) {
    this.usingTouchControls = true;
    let rect = event.target.getBoundingClientRect();
    for (let touch of event.touches) {
      if ((touch.clientY - rect.top) / this.stepSize < this.height / 2) {
        this.enemyTouchTarget = (touch.clientX - rect.left) / this.stepSize;
      }
      else {
        this.touchTarget = (touch.clientX - rect.left) / this.stepSize;
      }
    }
  }
  onTouchMove(event) {
    this.usingTouchControls = true;
    let rect = event.target.getBoundingClientRect();
    for (let touch of event.touches) {
      if ((touch.clientY - rect.top) / this.stepSize < this.height / 2) {
        this.enemyTouchTarget = (touch.clientX - rect.left) / this.stepSize;
      }
      else {
        this.touchTarget = (touch.clientX - rect.left) / this.stepSize;
      }
    }
  }
  onContextMenu() {
    return false;
  }
  score(winner) {
    winner.score++;
    this.ball.x = this.width / 2;
    this.ball.y = this.height / 2;
    this.ball.isMoving = false
    if (this.gameMode !== Mode.OnlineMultiPlayer) {
      this.ball.dy = Math.floor(Math.random() * 2);
      if (this.ball.dy === 0) {
        this.ball.dy = -1;
      }
      this.ballHit();
    }
    if (winner.score >= 7) {
      this.endGame();
      winner.isWinner = true;
      if (this.gameMode === Mode.LocalMultiPlayer) {
        if (this.player.isWinner) {
          this.gameOverText = "Player 1 wins!";
        }
        else {
          this.gameOverText = "Player 2 wins!";
        }
      }
      else {
        if (this.player.isWinner) {
          this.gameOverText = "You win!";
        }
        else {
          this.gameOverText = "You lose.";
        }
      }
      this.gamePhase = Phase.GameOver;
    }
    
    this.countdown = 100;
  }
  ballHit() {
    this.ball.dy *= -1.03;
    this.ball.dx = (Math.random() * 3) - 1.5;
    if (this.gameMode === Mode.OnlineMultiPlayer) {
      this.ball.isMoving = false;
      this.sendGameUpdate('hit', {
        ball: { x: this.ball.x, y: this.ball.y, dx: this.ball.dx, dy: this.ball.dy }
      });
    }
  }
  startGame() {
    window.dispatchEvent(new Event('resize'));
    this.player.isWinner = false;
    this.enemy.isWinner = false;
    this.player.score = 0;
    this.enemy.score = 0;
    this.countdown = 100;
    if (this.gameMode !== Mode.OnlineMultiPlayer) {
      this.ball.dy = Math.floor(Math.random() * 2);
      if (this.ball.dy === 0) {
        this.ball.dy = -1;
      }
      this.ballHit();
    }
    this.updateInterval = setInterval(this.update.bind(this), 10);
  }
  endGame() {
    clearInterval(this.updateInterval);
  }

  update() {

    if (this.countdown > 0) {
      this.countdown--;
    }
    else if (this.countdown === 0) {
      this.countdown--;
      this.ball.isMoving = true;
    }

    let oldX = this.player.x;

    this.calculateDx();
    this.player.x += this.player.dx;
    this.enemy.x += this.enemy.dx;

    if (this.player.x < 0) {
      this.player.x = 0;
    }
    else if (this.player.x + this.player.width > this.width) {
      this.player.x = this.width - this.player.width;
    }
    /*if (this.gameMode === Mode.OnlineMultiPlayer && this.player.x !== oldX) {
      this.sendGameUpdate('move', { x: this.player.x });
    }*/
    if (this.gameMode === Mode.OnlineMultiPlayer && this.player.dx !== this.player.oldDx) {
      this.sendGameUpdate('move', { dx: this.player.dx });
    }

    if (this.gameMode === Mode.SinglePlayer) {
      // center enemy paddle on ball, with buffer to prevent flickering
      if (this.ball.x > this.enemy.x + (this.enemy.width / 2) + 1) {
        this.enemy.x += .95;
      }
      else if (this.ball.x < this.enemy.x + (this.enemy.width / 2) - 1) {
        this.enemy.x -= .95;
      }
    }
    else if (this.gameMode === Mode.LocalMultiPlayer) {
      if (this.usingTouchControls) {
        if (this.enemyTouchTarget - 1 > this.enemy.x + this.enemy.width / 2) {
          this.enemy.x += 1;
        }
        else if (this.enemyTouchTarget + 1 < this.enemy.x + this.enemy.width / 2) {
          this.enemy.x -= 1;
        }
      }
      else {
        if (this.pressedKeys.key37) {
          this.enemy.x -= 1;
        }
        else if (this.pressedKeys.key39) {
          this.enemy.x += 1;
        }
      }
    }

    if (this.enemy.x < 0) {
      this.enemy.x = 0;
    }
    else if (this.enemy.x + this.enemy.width > this.width) {
      this.enemy.x = this.width - this.enemy.width;
    }

    if (this.ball.isMoving) {
      this.ball.x += this.ball.dx;
      this.ball.y += this.ball.dy;
      if (this.ball.x - this.ball.radius < 0) {
        this.ball.x = this.ball.radius;
        this.ball.dx *= -1;
      }
      else if (this.ball.x + this.ball.radius > this.width) {
        this.ball.x = this.width - this.ball.radius;
        this.ball.dx *= -1;
      }
      if (this.ball.y - this.ball.radius < 0) { // player gets a point
        if (this.gameMode !== Mode.OnlineMultiPlayer) {
          this.score(this.player);
        }
        
      }
      else if (this.ball.y + this.ball.radius >= this.player.y && this.ball.y + this.ball.radius < this.player.y + this.player.height
              && this.ball.x - this.ball.radius < this.player.x + this.player.width && this.ball.x + this.ball.radius > this.player.x) { // player hits the ball
        this.ball.y = this.player.y - this.ball.radius;
        this.ballHit();
      }
      else if (this.ball.y - this.ball.radius <= this.enemy.y + this.enemy.height && (this.ball.y - this.ball.radius) > this.enemy.y
              && this.ball.x - this.ball.radius < this.enemy.x + this.enemy.width && this.ball.x + this.ball.radius > this.enemy.x) { // enemy hits the ball
        this.ball.y = this.enemy.y + this.enemy.height + this.ball.radius;
        if (this.gameMode !== Mode.OnlineMultiPlayer) {
          this.ballHit();
        }
      }
      else if (this.ball.y + this.ball.radius > this.height) { // enemy gets a point
        if (this.gameMode !== Mode.OnlineMultiPlayer) {
          this.score(this.enemy);
        }
        else {
          this.ball.y = this.height / 2;
          this.sendGameUpdate('miss', undefined);
        }
      }
    }
    this.player.oldDx = this.player.dx;
    this.draw();
  }
  draw() {
    this.context.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);

    this.context.fillStyle = "#3aafa9";
    this.context.font = 8 * this.stepSize + 'px verdana';
    this.context.fillText(this.player.score.toString(), (this.width / 2) * this.stepSize, (this.height * this.heightUnit) - 3);
    this.context.fillText(this.enemy.score.toString(), (this.width / 2) * this.stepSize, 8 * this.stepSize)
    this.context.beginPath();
    this.context.arc(this.ball.x * this.stepSize, this.ball.y * this.heightUnit, this.ball.radius * this.stepSize, 0, Math.PI*2);
    this.context.fill();
    this.context.closePath();

    this.context.fillRect(this.player.x * this.stepSize, this.player.y * this.heightUnit, 
                          this.player.width * this.stepSize, this.player.height * this.heightUnit);
    this.context.fillRect(this.enemy.x * this.stepSize, this.enemy.y * this.heightUnit, 
      this.enemy.width * this.stepSize, this.enemy.height * this.heightUnit);
  }

  sendGameUpdate(action: string, data: any) {
    let update = {
      game: 'pong',
      action: action,
      data: data
    }
    this.chatService.send('game', update);
  }
  respondToServerEvent(message: GameUpdate) {
    switch(message.action) {
      case 'matched':
        this.gamePhase = Phase.MainGame;
        this.ball.dx = message.data.ball.dx;
        this.ball.dy = message.data.ball.dy;
        this.startGame();
        break;
      case 'disconnected':
        this.gamePhase = Phase.PlayerNumberChoice;
        this.endGame();
        break;
      case 'move':
        this.enemy.dx = message.data.dx;
        break;
      case 'hit':
        if (this.ball.isMoving) {
          this.ball.dy = message.data.ball.dy * -1;
          this.ball.x = message.data.ball.x;
          this.ball.y = this.height - message.data.ball.y;
          this.ball.dx = message.data.ball.dx;
        }
        else {
          this.ball.isMoving = true;
        }
        break;
      case 'reset':
        this.countdown = 100;
        this.ball.dx = message.data.ball.dx;
        this.ball.dy = message.data.ball.dy;
        if (message.data.win) {
          this.score(this.player);
        }
        else {
          this.score(this.enemy);
        }
        break;
    }
  }
}
