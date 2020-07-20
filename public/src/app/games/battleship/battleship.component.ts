import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-battleship',
  templateUrl: './battleship.component.html',
  styleUrls: ['./battleship.component.css']
})
export class BattleshipComponent implements OnInit {

  playerBoard: number[][];
  enemyBoard: number[][];
  height: number = 8;
  width: number = 8;
  
  constructor() {
    this.playerBoard = [];
    this.enemyBoard = [];
    for (let i = 0; i < this.height; i++) {
      this.playerBoard.push([]);
      this.enemyBoard.push([]);
      for (let j = 0; j < this.height; j++) {
        this.playerBoard[i].push(0);
        this.enemyBoard[i].push(0);
      }
    }
  }

  ngOnInit(): void {
  }

  onClickPlayerSquare(i: number, j: number) {
    this.playerBoard[i][j] = 1;
  }
  onClickEnemySquare(i: number, j:number) {
    this.enemyBoard[i][j] = 2;
  }

}
