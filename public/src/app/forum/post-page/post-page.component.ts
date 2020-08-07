import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ForumService } from '../../services/forum.service';
import { Post } from 'src/app/models/forum/post';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-post-page',
  templateUrl: './post-page.component.html',
  styleUrls: ['./post-page.component.css']
})
export class PostPageComponent implements OnInit {
  post: Post;
  postId: string;
  commentForm = new FormGroup({
    text: new FormControl(''),
  });

  constructor(
    private route: ActivatedRoute,
    private forumService: ForumService,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.postId = params['id'];
      this.forumService.getPost(this.postId).subscribe(post => {
        this.post = post;
      });
    });
  }

  onSubmitComment(): void {
    this.forumService.createComment(this.commentForm.value.text, this.postId).subscribe(data => {
      console.log(data);
    });
    this.commentForm.patchValue({ text: '' });
  }
}
