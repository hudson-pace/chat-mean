import { Component, OnInit, Input } from '@angular/core';
import { ForumService } from '../../services/forum.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  @Input() post;
  constructor(
    private forumService: ForumService,
  ) { }

  ngOnInit(): void {
    if (!this.post.author) {
      this.post.author = "[deleted]";
    }
  }

  upvotePost(): void {
    this.forumService.upvotePost(this.post.postId).subscribe(response => console.log(response));
  }

}
