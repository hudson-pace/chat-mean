import { Comment } from './comment';

export interface Post {
    text: string;
    author: string;
    tags: string[];
    datePosted: string;
    comments: Comment[];
    _id: string;
}