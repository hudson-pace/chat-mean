import { Component, OnInit } from '@angular/core';
import { ForumService } from '../../services/forum.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {
  private subscription: Subscription = new Subscription();
  author: string;
  postForm = new FormGroup({
    text: new FormControl(''),
    tags: new FormControl('')
  });

  constructor(
    private forumService: ForumService,
    private authenticationService: AuthenticationService
  ) {
    this.subscription.add(authenticationService.getUserSubject().subscribe(x => this.author = x.username));
  }

  ngOnInit(): void {
  }

  onSubmit() {
    this.createPost(this.postForm.value);
  }
  createPost(postData) {
    this.forumService.createPost(postData.text, postData.tags.split(', ')).subscribe(data => {
      console.log(data);
    });
  }

}
