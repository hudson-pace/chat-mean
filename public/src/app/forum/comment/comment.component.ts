import { Component, OnInit, Input } from '@angular/core';
import { faThumbsUp, faCommentAlt, faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';

import { ForumService } from '../../services/forum.service';


@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {
  faThumbsUp = faThumbsUp;
  faCommentAlt = faCommentAlt;
  faMinusCircle = faMinusCircle;
  faPlusCircle = faPlusCircle;
  @Input() comment;
  @Input() children: Comment[];
  @Input() postId;
  isCollapsed: boolean = false;
  constructor(
    private forumService: ForumService
  ) { }

  ngOnInit(): void {
    if (!this.comment.author) {
      this.comment.author = "[deleted]";
    }
  }
  onClickLikeButton(): void {
    if (this.comment.hasBeenUpvoted) {
      this.forumService.undoCommentUpvote(this.comment._id).subscribe(response => console.log(response));
    }
    else {
      this.forumService.upvoteComment(this.comment._id).subscribe(response => console.log(response));
    }
  }
  replyToComment(commentText) {
    this.forumService.createCommentReply(commentText, this.comment._id, this.postId).subscribe(response => console.log(response));
  }
  collapse() {
    this.isCollapsed = true;
  }
  expand() {
    this.isCollapsed = false;
  }
}
