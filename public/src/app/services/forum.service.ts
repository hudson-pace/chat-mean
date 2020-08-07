import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Post } from '../models/forum/post';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ForumService {

  constructor(
    private httpClient: HttpClient
  ) { }

  createPost(text: string, tags: string) {
    return this.httpClient.post<any>(`${environment.apiUrl}/posts`, {
      text: text,
      tags: tags
    }, { withCredentials: true });
  }
  getAllPosts() {
    return this.httpClient.get<Post[]>(`${environment.apiUrl}/posts`);
  }
  getPost(postId) {
    return this.httpClient.get<Post>(`${environment.apiUrl}/posts/${postId}`);
  }
  getCommentReplies(commentId: string) {
    return this.httpClient.get<any>(`${environment.apiUrl}/posts/comments/${commentId}`);
  }
  createComment(text:string, postId: string) {
    return this.httpClient.post<any>(`${environment.apiUrl}/posts/${postId}`, { text: text }, { withCredentials: true });
  }
  createCommentReply(text: string, commentId: string) {
    return this.httpClient.post<any>(`${environment.apiUrl}/posts/comments/${commentId}`, { text: text }, { withCredentials: true });
  }
}
