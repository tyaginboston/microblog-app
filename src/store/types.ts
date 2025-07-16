import type { Post, Comment, User } from '../types/api';

// State interfaces for RxJS stores (replacing Redux state shape)
export interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
}

export interface UsersState {
  users: Record<number, User>;
  loading: boolean;
  error: string | null;
}

export interface CommentsState {
  commentsByPost: Record<number, Comment[]>;
  loading: boolean;
  error: string | null;
}

export interface PostDetailState {
  post: Post | null;
  comments: Comment[];
  author: User | null;
  loading: boolean;
  error: string | null;
}

// Loading states for different operations
export interface LoadingState {
  [key: string]: boolean;
}