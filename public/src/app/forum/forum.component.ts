import { Component, OnInit } from '@angular/core';
import { Post } from '../models/forum/post';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})
export class ForumComponent implements OnInit {
  posts: Post[] = [
    {
      text: "Be yourself; Everyone else is already taken.",
      from: "Oscar Wilde",
      tags: ["inspirational", "misattributed quotes"]
    },
    {
      text: "So many books, so little time.",
      from: "Frank Zappa",
      tags: ["books", "humor"]
    },
    {
      text: "A room without books is like a body without a soul.",
      from: "Marcus Tullius Cicero",
      tags: ["books", "soul"]
    }
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
