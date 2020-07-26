import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { CONTEXT_NAME } from '@angular/compiler/src/render3/view/util';
import { ChatService } from './../../services/chat.service';
import { Subscription } from 'rxjs';

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
  private pressedKeys = {
    w: false,
    a: false,
    s: false,
    d: false
  }


  constructor(private chatService: ChatService) {
    this.subscription.add(this.chatService.receiveGameUpdates().subscribe(x => {
      if (x.game === 'move-around') {
      }
    }));
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.gameCanvas.nativeElement.width = this.gameCanvas.nativeElement.clientWidth;
    this.gameCanvas.nativeElement.height = this.gameCanvas.nativeElement.clientHeight;
    this.context = this.gameCanvas.nativeElement.getContext('2d');
    this.context.moveTo(0, 0);
    this.context.lineTo(300, 200);
    this.context.stroke();

    setInterval(this.update.bind(this), 10);
  }

  update() {
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
    this.draw();
  }
  draw() {
    this.context.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
    this.context.beginPath();
    this.context.arc(this.x, this.y, 10, 0, Math.PI*2);
    this.context.fillStyle = "#0095DD";
    this.context.fill();
    this.context.closePath();
  }

  onKeyDown(event: any) {
    switch (event.keyCode) {
      case 65:
        if (!this.pressedKeys.a) {
          this.pressedKeys.a = true;
          this.dx -= 3;
        }
        break;
      case 68:
        if (!this.pressedKeys.d) {
          this.pressedKeys.d = true;
          this.dx += 3;
        }
        break;
      case 87:
        if (!this.pressedKeys.w) {
          this.pressedKeys.w = true;
          this.dy -= 3;
        }
        break;
      case 83:
        if (!this.pressedKeys.s) {
          this.pressedKeys.s = true;
          this.dy += 3;
        }
        break;
    }
  }
  onKeyUp(event: any) {
    switch (event.keyCode) {
      case 65:
        this.pressedKeys.a = false;
        this.dx += 3;
        break;
      case 68:
        this.pressedKeys.d = false;
        this.dx -= 3;
        break;
      case 87:
        this.pressedKeys.w = false;
        this.dy += 3;
        break;
      case 83:
        this.pressedKeys.s = false;
        this.dy -= 3;
        break;
    }
  }

}
