import { Component, OnInit } from '@angular/core';
import { Post } from '../models/forum/post';
import { ForumService } from '../services/forum.service';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})
export class ForumComponent implements OnInit {
  posts: Post[];
  constructor(
    private forumService: ForumService
  ) { }

  ngOnInit(): void {
  }


  getPosts() {
    this.forumService.getAllPosts().subscribe((posts: Post[]) => {
      this.posts = posts;
    });
  }

}