import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Subscription } from 'rxjs';
import { GameUpdate } from '../../models/game-update';

enum Phase {
    Start,
    WaitingForMatch,
    Setup,
    MainGame,
    End
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
  isSunk: boolean;
}

@Component({
  selector: 'app-battleship',
  templateUrl: './battleship.component.html',
  styleUrls: ['./battleship.component.css']
})
export class BattleshipComponent implements OnDestroy {
  Phase = Phase;
  phase: Phase = Phase.Start;
  win: boolean;
  private subscription: Subscription = new Subscription();
  private playerBoard: Square[][];
  private enemyBoard: Square[][];
  private height: number = 8;
  private width: number = 8;
  private lengths: number[] = [4, 3, 2];
  private playerShipLengths: number[];
  private enemyShipLengths: number[];
  private playerShips: number[][][] = [];
  private enemyShips: number[][][] = [];
  private currentShip: number;
  private orientation: boolean = false;
  private mode: Mode;
  private isPlayerTurn: boolean = false;
  
  constructor(private chatService: ChatService) {
    this.subscription.add(this.chatService.receiveGameUpdates().subscribe(x => {
      if (x.game === 'battleship') {
        this.respondToServerEvent(x);
      }
    }));
    this.resetGame();
  }

  resetGame() {
    this.generateBoards();
    this.generateShipLengths();
    this.playerShips = [];
    this.enemyShips = [];
    this.isPlayerTurn = false;
  }

  generateBoards() {
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
          isValid: false,
          isSunk: false
        });
        this.enemyBoard[i].push({
          hasBoat: false,
          isHit: false,
          isSelected: false,
          isValid: false,
          isSunk: false
        });
      }
    }
  }

  generateShipLengths() {
    this.playerShipLengths = [];
    this.enemyShipLengths = [];
    for (let i = 0; i < this.lengths.length; i++) {
      this.playerShipLengths.push(this.lengths[i]);
      this.enemyShipLengths.push(this.lengths[i]);
    }
    this.currentShip  = this.playerShipLengths.pop();
  }

  ngOnDestroy(): void {
    this.sendUpdate('leave', null);
  }

  onRightClick(i: number, j: number) {
    this.onLeavePlayerSquare(i, j);
    this.orientation = !this.orientation;
    this.onEnterPlayerSquare(i, j);
    return false;
  }

  onClickPlayerSquare(x: number, y: number) {
    if (this.playerBoard[x][y].isValid) {
      this.placeBoat(this.playerBoard, x, y, this.currentShip, this.orientation, this.playerShips);
      this.onLeavePlayerSquare(x, y);
      if (this.playerShipLengths.length > 0) {
        this.currentShip = this.playerShipLengths.pop();
        this.onEnterPlayerSquare(x, y);
      }
      else {
        if (this.mode === Mode.Multiplayer) {
          this.sendUpdate('ready', null);
        }
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
    if (this.phase === Phase.MainGame && !this.enemyBoard[i][j].isHit) {
      if (this.mode === Mode.Singleplayer) {
        this.hitSquare(this.enemyBoard, this.enemyShips, i, j);
        let x: number = Math.floor(Math.random() * this.height);
        let y: number = Math.floor(Math.random() * this.width);
        while (this.playerBoard[x][y].isHit) {
          x = Math.floor(Math.random() * this.height);
          y = Math.floor(Math.random() * this.width);
        }
        this.hitSquare(this.playerBoard, this.playerShips, x, y);
      }
      else if (this.isPlayerTurn) {
        this.sendUpdate('attack', { coordinates: [i, j] });
        this.isPlayerTurn = false;
      }
    }
  }

  onClickSinglePlayer() {
    this.placeEnemyBoats();
    this.phase = Phase.Setup;
    this.mode = Mode.Singleplayer;
  }

  onClickMultiPlayer() {
    this.phase = Phase.WaitingForMatch;
    this.mode = Mode.Multiplayer;
    setTimeout(() => {
      let update = {
        game: 'battleship',
        action: 'join_queue',
        data: undefined
      }
      this.sendUpdate('join_queue', null);
    }, 500); // wait to avoid flash of queue dialog
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

  placeBoat(board: Square[][], x: number, y: number, size: number, orientation: boolean, boatList: number[][][]) {
    let boatIndex = boatList.length;
    boatList.push([]);
    for (let i = 0; i < size; i++) {
      if (orientation) {
        board[x + i][y].isValid = false;
        board[x + i][y].hasBoat = true;
        boatList[boatIndex].push([x + i, y]);
      }
      else {
        board[x][y + i].isValid = false;
        board[x][y + i].hasBoat = true;
        boatList[boatIndex].push([x, y + i]);
      }
    }
  }

  placeEnemyBoats() {
    let currentShip: number;
    while (this.enemyShipLengths.length > 0) {
      currentShip = this.enemyShipLengths.pop();
      let x = this.height;
      let y = this.width;
      let orientation = false;
      while (!this.changeSquares(this.enemyBoard, x, y, currentShip, orientation, false)) {
        x = Math.floor(Math.random() * this.height);
        y = Math.floor(Math.random() * this.width);
        orientation = Math.random() >= 0.5;
      }
      this.placeBoat(this.enemyBoard, x, y, currentShip, orientation, this.enemyShips);
    }
  }

  hitSquare(board: Square[][], boats: number[][][], x: number, y: number) {
    board[x][y].isHit = true;
    let found: boolean = false;
    if (board[x][y].hasBoat) {
      for (let i = 0; i < boats.length; i++) {
        for (let j = 0; j < boats[i].length; j++) {
          if (boats[i][j][0] === x && boats[i][j][1] === y) {
            this.tryToSinkBoat(board, boats, i);
            found = true;
            break;
          }
        }
        if (found) {
          break;
        }
      }
    }
  }

  tryToSinkBoat(board: Square[][], boats: number[][][], boatIndex: number) {
    let sunk: boolean = true;
    for (let i = 0; i < boats[boatIndex].length; i++) {
      if (!board[boats[boatIndex][i][0]][boats[boatIndex][i][1]].isHit) {
        sunk = false;
        break;
      }
    }
    if (sunk) {
      for (let i = 0; i < boats[boatIndex].length; i++) {
        board[boats[boatIndex][i][0]][boats[boatIndex][i][1]].isSunk = true;
      }
      boats.splice(boatIndex, 1);
      if (boats.length === 0) {
        if (board === this.enemyBoard) {
          this.win = true;
        }
        else {
          this.win = false;
          if (this.mode === Mode.Multiplayer) {
            this.sendUpdate('game_over', null);
          }
        }
        this.phase = Phase.End;
      }
    }
  }

  onClickRematch() {
    this.resetGame();
    if (this.mode === Mode.Singleplayer) {
      this.onClickSinglePlayer();
    }
    this.phase = Phase.Setup;
  }
  
  onClickReturn() {
    this.sendUpdate('leave', null);
    this.resetGame();
    this.phase = Phase.Start;
  }

  respondToServerEvent(message: GameUpdate) {
    switch (message.action) {
      case 'matched':
        this.phase = Phase.Setup;
        break;
      case 'start':
        this.isPlayerTurn = message.data.turn;
        break;
      case 'attack':
        this.isPlayerTurn = true;
        let coordinates = message.data.coordinates;
        let square = this.playerBoard[coordinates[0]][coordinates[1]];
        let boat = this.getBoatFromCoords(coordinates, this.playerShips)
        this.hitSquare(this.playerBoard, this.playerShips, coordinates[0], coordinates[1]);
        let data;
        if (square.isSunk) {
          data = {
            status: 'sunk',
            squares: boat
          }
        }
        else if (square.hasBoat) {
          data = {
            status: 'hit',
            squares: [coordinates]
          }
        }
        else {
          data = {
            status: 'miss',
            squares: [coordinates]
          }
        }
        this.sendUpdate('attack_response', data)
        break;
      case 'attack_response':
        let squares = message.data.squares;
        if (message.data.status === 'hit') {
          this.enemyBoard[squares[0][0]][squares[0][1]].hasBoat = true;
          this.enemyBoard[squares[0][0]][squares[0][1]].isHit = true;
        }
        else if (message.data.status === 'miss') {
          this.enemyBoard[squares[0][0]][squares[0][1]].isHit = true;
        }
        else if (message.data.status === 'sunk') {
          for (let i = 0; i < squares.length; i++) {
            this.enemyBoard[squares[i][0]][squares[i][1]].hasBoat = true;
            this.enemyBoard[squares[i][0]][squares[i][1]].isHit = true;
            this.enemyBoard[squares[i][0]][squares[i][1]].isSunk = true;
          }
        }
        break;
      case 'game_over':
        this.win = true;
        this.phase = Phase.End;
        break;
      case 'disconnected':
        this.resetGame();
        this.phase = Phase.Start;
        break;
    }
  }

  getBoatFromCoords(coords: number[], boats: number[][][]) {
    for (let i = 0; i < boats.length; i++) {
      for (let k = 0; k < boats[i].length; k++) {
        if (boats[i][k][0] === coords[0] && boats[i][k][1] === coords[1]) {
          return boats[i];
        }
      }
    }
    return null;
  }

  sendUpdate(action: string, data: any) {
    let update = {
      game: 'battleship',
      action: action,
      data: data
    }
    this.chatService.send('game', update);
  }
}