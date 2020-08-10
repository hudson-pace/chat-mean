import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-game-menu',
  templateUrl: './game-menu.component.html',
  styleUrls: ['./game-menu.component.css']
})
export class GameMenuComponent implements OnInit {
  @Input() title: string;
  @Input() options: string[];
  @Output() choiceEvent = new EventEmitter<string>();
  constructor() { }

  ngOnInit(): void {
  }
  chooseOption(option: string): void {
    this.choiceEvent.emit(option);
  }

}
