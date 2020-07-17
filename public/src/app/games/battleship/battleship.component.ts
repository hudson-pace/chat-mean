import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-battleship',
  templateUrl: './battleship.component.html',
  styleUrls: ['./battleship.component.css']
})
export class BattleshipComponent implements OnInit {

  rows: number[];
  columns: number[];
  
  constructor() {
    this.rows = Array(10).fill(0).map((x, i) => i);
    this.columns = Array(10).fill(0).map((x, i) => i);
  }

  ngOnInit(): void {
  }

}
