import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { CONTEXT_NAME } from '@angular/compiler/src/render3/view/util';

@Component({
  selector: 'app-move-around',
  templateUrl: './move-around.component.html',
  styleUrls: ['./move-around.component.css']
})
export class MoveAroundComponent implements OnInit, AfterViewInit {
  @ViewChild('gameCanvas', {static: false}) gameCanvas: ElementRef;
  context: CanvasRenderingContext2D;


  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.context = this.gameCanvas.nativeElement.getContext('2d');
    this.context.moveTo(0, 0);
    this.context.lineTo(300, 200);
    this.context.stroke();
  }

}
