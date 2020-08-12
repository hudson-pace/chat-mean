import { Component, OnInit, Input } from '@angular/core';
import { ForumService } from '../../services/forum.service';
import { faCommentAlt, faThumbsUp } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  @Input() post;
  faCommentAlt = faCommentAlt;
  faThumbsUp = faThumbsUp;

  constructor(
    private forumService: ForumService,
  ) { }

  ngOnInit(): void {
    if (!this.post.author) {
      this.post.author = "[deleted]";
    }
  }

  clickVoteButton(event): void {
    event.stopPropagation();
    if (this.post.hasBeenUpvoted) {
      this.forumService.undoPostUpvote(this.post.postId).subscribe(response => {
        if (response.success) {
          this.post.hasBeenUpvoted = false;
          this.post.votes -= 1;
        }
      });
    }
    else {
      this.forumService.upvotePost(this.post.postId).subscribe(response => {
        if (response.success) {
          this.post.hasBeenUpvoted = true;
          this.post.votes += 1;
        }
      });
    }
  }

}
