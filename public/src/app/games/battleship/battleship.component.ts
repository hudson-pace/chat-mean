import { Component, OnInit, ɵSWITCH_IVY_ENABLED__POST_R3__ } from '@angular/core';

enum Phase {
    Start,
    Setup,
    MainGame,
}
enum Mode {
  Singleplayer,
  Multiplayer
}
type Square = {
  hasBoat: boolean;
  isHit: boolean;
  isSelected: boolean;
  isValid: boolean;
}

@Component({
  selector: 'app-battleship',
  templateUrl: './battleship.component.html',
  styleUrls: ['./battleship.component.css']
})
export class BattleshipComponent implements OnInit {
  Phase = Phase;
  Mode = Mode;
  playerBoard: Square[][];
  enemyBoard: Square[][];
  height: number = 20;
  width: number = 20;
  phase: Phase = Phase.Start;
  ships: number[] = [4, 3, 2];
  enemyShips: number[] = [4, 3, 2];
  currentShip: number = this.ships.pop();
  orientation: boolean = false;
  mode: Mode;
  
  constructor() {
    this.playerBoard = [];
    this.enemyBoard = [];
    for (let i = 0; i < this.height; i++) {
      this.playerBoard.push([]);
      this.enemyBoard.push([]);
      for (let j = 0; j < this.width; j++) {
        this.playerBoard[i].push({
          hasBoat: false,
          isHit: false,
          isSelected: false,
          isValid: false
        });
        this.enemyBoard[i].push({
          hasBoat: false,
          isHit: false,
          isSelected: false,
          isValid: false
        });
      }
    }
  }

  ngOnInit(): void {
  }
  onRightClick(i: number, j: number) {
    this.onLeavePlayerSquare(i, j);
    this.orientation = !this.orientation;
    this.onEnterPlayerSquare(i, j);
    return false;
  }

  onClickPlayerSquare(x: number, y: number) {
    if (this.playerBoard[x][y].isValid) {
      this.placeBoat(this.playerBoard, x, y, this.currentShip, this.orientation);
      this.onLeavePlayerSquare(x, y);
      if (this.ships.length > 0) {
        this.currentShip = this.ships.pop();
        this.onEnterPlayerSquare(x, y);
      }
      else {
        this.phase = Phase.MainGame;
      }
    }
  }
  onEnterPlayerSquare(x: number, y: number) {
    if (this.phase === Phase.Setup) {
      this.changeSquares(this.playerBoard, x, y, this.currentShip, this.orientation, true);
    }
  }
  onLeavePlayerSquare(x: number, y: number) {
    if (this.phase === Phase.Setup) {
      this.changeSquares(this.playerBoard, x, y, this.currentShip, this.orientation, false);
    }
  }
  onClickEnemySquare(i: number, j:number) {
    if (this.phase === Phase.MainGame && this.mode === Mode.Singleplayer && !this.enemyBoard[i][j].isHit) {
      this.enemyBoard[i][j].isHit = true;
      let x: number = Math.floor(Math.random() * this.height);
      let y: number = Math.floor(Math.random() * this.width);
      while (this.playerBoard[x][y].isHit) {
        x = Math.floor(Math.random() * this.height);
        y = Math.floor(Math.random() * this.width);
      }
      this.playerBoard[x][y].isHit = true;
    }
  }
  onClickSinglePlayer() {
    this.placeEnemyBoats();
    this.phase = Phase.Setup;
    this.mode = Mode.Singleplayer;
  }
  onClickMultiPlayer() {
  }

  changeSquares(board: Square[][], x: number, y: number, size: number, orientation: boolean, selecting: boolean) {
    let valid = true;
    for (let i = 0; i < size; i++) {
      if (orientation) {
        if (x + i < this.height) {
          board[x + i][y].isSelected = selecting;
          board[x + i][y].isValid = selecting;
          if (board[x + i][y].hasBoat) {
            valid = false;
          }
        }
        else {
          valid = false;
        }
      }
      else {
        if (y + i < this.width) {
          board[x][y + i].isSelected = selecting;
          board[x][y + i].isValid = selecting;
          if (board[x][y + i].hasBoat) {
            valid = false;
          }
        }
        else {
          valid = false;
        }
      }
    }

    if (!valid && selecting) {
      for (let i = 0; i < size; i++) {
        if (orientation) {
          if (x + i < this.height) {
            board[x + i][y].isValid = false;
          }
        }
        else {
          if (y + i < this.width) {
            board[x][y + i].isValid = false;
          }
        }
      }
    }

    return valid;
  }

  placeBoat(board: Square[][], x: number, y: number, size: number, orientation: boolean) {
    for (let i = 0; i < size; i++) {
      if (orientation) {
        board[x + i][y].isValid = false;
        board[x + i][y].hasBoat = true;
      }
      else {
        board[x][y + i].isValid = false;
        board[x][y + i].hasBoat = true;
      }
    }
  }

  placeEnemyBoats() {
    let currentShip: number;
    while (this.enemyShips.length > 0) {
      currentShip = this.enemyShips.pop();
      let x = this.height;
      let y = this.width;
      let orientation = false;
      while (!this.changeSquares(this.enemyBoard, x, y, currentShip, orientation, false)) {
        x = Math.floor(Math.random() * this.height);
        y = Math.floor(Math.random() * this.width);
        orientation = Math.random() >= 0.5;
      }
      this.placeBoat(this.enemyBoard, x, y, currentShip, orientation);
    }
  }
}
