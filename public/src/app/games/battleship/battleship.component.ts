import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-battleship',
  templateUrl: './battleship.component.html',
  styleUrls: ['./battleship.component.css']
})
export class BattleshipComponent implements OnInit {

  squares: number[][];
  height: number = 10;
  width: number = 10;
  
  constructor() {
    this.squares = [];
    for (let i = 0; i < this.height; i++) {
      this.squares.push([]);
      for (let j = 0; j < this.height; j++) {
        this.squares[i].push(0);
      }
    }
  }

  ngOnInit(): void {
  }

  onClickSquare(i: number, j: number) {
    this.squares[i][j] = 1;
  }

}
