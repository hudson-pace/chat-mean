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
}
