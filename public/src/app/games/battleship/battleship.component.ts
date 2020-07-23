import { Component, OnInit, ɵSWITCH_IVY_ENABLED__POST_R3__ } from '@angular/core';

enum Phase {
    Start,
    Setup,
    MainGame,
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
  playerBoard: Square[][];
  enemyBoard: Square[][];
  height: number = 8;
  width: number = 8;
  phase: Phase = Phase.Start;
  ships: number[] = [4, 3, 2];
  currentShip: number = this.ships.pop();
  orientation: boolean = false;
  
  constructor() {
    this.playerBoard = [];
    this.enemyBoard = [];
    for (let i = 0; i < this.height; i++) {
      this.playerBoard.push([]);
      this.enemyBoard.push([]);
      for (let j = 0; j < this.height; j++) {
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
      for (let i = 0; i < this.currentShip; i++) {
        if (this.orientation) {
          this.playerBoard[x + i][y].isValid = false;
          this.playerBoard[x + i][y].hasBoat = true;
        }
        else {
          this.playerBoard[x][y + i].isValid = false;
          this.playerBoard[x][y + i].hasBoat = true;
        }
      }
      if (this.ships.length > 0) {
        this.onLeavePlayerSquare(x, y);
        this.currentShip = this.ships.pop();
        this.onEnterPlayerSquare(x, y);
      }
      else {
        this.onLeavePlayerSquare(x, y);
        this.phase = Phase.MainGame;
      }
    }
  }
  onEnterPlayerSquare(x: number, y: number) {
    if (this.phase === Phase.Setup) {
      let valid = true;
      for (let i = 0; i < this.currentShip; i++) {
        if (this.orientation) {
          if (x + i < this.height) {
            this.playerBoard[x + i][y].isSelected = true;
            this.playerBoard[x + i][y].isValid = true;
            if (this.playerBoard[x + i][y].hasBoat) {
              valid = false;
            }
          }
          else {
            valid = false;
          }
        }
        else {
          if (y + i < this.width) {
            this.playerBoard[x][y + i].isSelected = true;
            this.playerBoard[x][y + i].isValid = true;
            if (this.playerBoard[x][y + i].hasBoat) {
              valid = false;
            }
          }
          else {
            valid = false;
          }
        }
      }

      if (!valid) {
        for (let i = 0; i < this.currentShip; i++) {
          if (this.orientation) {
            if (x + i < this.height) {
              this.playerBoard[x + i][y].isValid = false;
            }
          }
          else {
            if (y + i < this.width) {
              this.playerBoard[x][y + i].isValid = false;
            }
          }
        }
      }
    }
  }
  onLeavePlayerSquare(x: number, y: number) {
    if (this.phase === Phase.Setup) {
      for(let i = 0; i < this.currentShip; i++) {
        if (this.orientation) {
          if (x + i < this.height) {
            this.playerBoard[x + i][y].isSelected = false;
            this.playerBoard[x + i][y].isValid = false;
          }
        }
        else {
          if (y + i < this.height) {
            this.playerBoard[x][y + i].isSelected = false;
            this.playerBoard[x][y + i].isValid = false;
          }
        }
      }
    }
  }
  onClickEnemySquare(i: number, j:number) {
    //this.enemyBoard[i][j][0] = 2;
  }
  onClickSinglePlayer() {
    this.phase = Phase.Setup;
  }
  onClickMultiPlayer() {
  }
}
