import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-pong',
  templateUrl: './pong.component.html',
  styleUrls: ['./pong.component.css']
})
export class PongComponent implements OnInit {
  @ViewChild('gameCanvas', {static: false}) gameCanvas: ElementRef;
  context: CanvasRenderingContext2D;
  stepSize: number;
  heightUnit: number;
  width: number = 100;
  height: number = 200;
  countdown: number = 100;
  pressedKeys = {
    key65: false,
    key68: false
  }
  player = {
    x: 0,
    y: 0,
    dx: 0,
    width: 16,
    height: 4,
    score: 0,
  }
  enemy = {
    x: 0,
    y: 0,
    dx: 0,
    width: 16,
    height: 4,
    score: 0,
  }
  ball = {
    x: this.width / 2,
    y: this.height / 2,
    dx: 0,
    dy: 0,
    radius: 2,
  }
  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.onResize();
    this.context = this.gameCanvas.nativeElement.getContext('2d');

    setInterval(this.update.bind(this), 10);
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
  score(winner) {
    this.ball.x = this.width / 2;
    this.ball.y = this.height / 2;
    this.ball.dx = 0;
    this.ball.dy = 0;
    winner.score++;
    this.countdown = 100;
  }
  update() {
    if (this.countdown > 0) {
      this.countdown--;
    }
    else if (this.countdown === 0) {
      this.countdown--;
      this.ball.dx = 1;
      this.ball.dy = 1;
      let direction = Math.floor(Math.random() * 2);
      if (direction === 0) {
        this.ball.dy = -1;
      }
      else {
        this.ball.dy = 1;
      }
    }
    this.player.dx = 0;
    if (this.pressedKeys.key65) {
      this.player.dx -= 1;
    }
    if (this.pressedKeys.key68) {
      this.player.dx += 1;
    }
    this.player.x += this.player.dx;
    if (this.player.x < 0) {
      this.player.x = 0;
    }
    else if (this.player.x + this.player.width > this.width) {
      this.player.x = this.width - this.player.width;
    }


    if (this.ball.x > this.enemy.x + (this.enemy.width / 2)) {
      this.enemy.x += .85;
    }
    else {
      this.enemy.x -= .85;
    }


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
      this.score(this.player);
    }
    else if (this.ball.y + this.ball.radius >= this.player.y && this.ball.y + this.ball.radius - this.player.height < this.player.y
             && this.ball.x < this.player.x + this.player.width && this.ball.x > this.player.x) { // player hits the ball
      this.ball.y = this.player.y - this.ball.radius;
      this.ball.dy *= -1;
    }
    else if (this.ball.y - this.ball.radius <= this.enemy.y && this.ball.y - this.ball.radius + this.enemy.height < this.enemy.y + this.enemy.height
            && this.ball.x < this.enemy.x + this.enemy.width && this.ball.x > this.enemy.x) {
      this.ball.y = this.enemy.y + this.enemy.height + this.ball.radius;
      this.ball.dy *= -1;
    }
    else if (this.ball.y + this.ball.radius > this.height) { // enemy gets a point
      this.score(this.enemy);
    }

    this.draw();
  }
  draw() {
    this.context.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);

    this.context.fillStyle = "#0095DD";
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
}
