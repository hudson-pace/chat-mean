import { Component, OnInit, Input } from '@angular/core';
import { ForumService } from '../../services/forum.service';


@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {
  @Input() comment;
  childComments;
  constructor(
    private forumService: ForumService
  ) { }

  ngOnInit(): void {
    this.forumService.getCommentReplies(this.comment._id).subscribe(children => this.childComments = children);
  }
}
