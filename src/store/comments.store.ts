import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, catchError, tap, distinctUntilChanged } from 'rxjs/operators';
import { fetchComments } from '../services/api';
import type { Comment } from '../types/api';
import type { CommentsState } from './types';

/**
 * Comments Store using RxJS (replaces Redux actions/reducers pattern)
 * 
 * Manages comments data with caching by post ID
 */
class CommentsStore {
  private readonly _state$ = new BehaviorSubject<CommentsState>({
    commentsByPost: {},
    loading: false,
    error: null,
  });

  private readonly _loadComments$ = new BehaviorSubject<number | null>(null);

  constructor() {
    this.initializeCommentsLoader();
  }

  get state$(): Observable<CommentsState> {
    return this._state$.asObservable().pipe(distinctUntilChanged());
  }

  get currentState(): CommentsState {
    return this._state$.value;
  }

  // Action method
  loadComments(postId: number): void {
    // Check if comments are already cached
    if (this.currentState.commentsByPost[postId]) {
      return; // Comments already loaded
    }
    this._loadComments$.next(postId);
  }

  // Get comments for a specific post (synchronous access to cached data)
  getComments(postId: number): Comment[] {
    return this.currentState.commentsByPost[postId] || [];
  }

  // Observable for comments of a specific post
  getComments$(postId: number): Observable<Comment[]> {
    return this.state$.pipe(
      map(state => state.commentsByPost[postId] || []),
      distinctUntilChanged()
    );
  }

  private initializeCommentsLoader(): void {
    this._loadComments$
      .pipe(
        tap(() => this.setState({ loading: true, error: null })),
        switchMap(postId => {
          if (postId === null) return of(null);
          
          return of(null).pipe(
            switchMap(() => fetchComments(postId)),
            map(comments => ({ postId, comments, loading: false, error: null })),
            catchError(error => of({
              postId,
              comments: [],
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to load comments'
            }))
          );
        })
      )
      .subscribe(result => {
        if (result?.postId !== undefined && result.comments) {
          this.addComments(result.postId, result.comments);
        }
        this.setState({ loading: result?.loading || false, error: result?.error || null });
      });
  }

  private addComments(postId: number, comments: Comment[]): void {
    const currentState = this._state$.value;
    const newCommentsByPost = { 
      ...currentState.commentsByPost, 
      [postId]: comments 
    };
    this.setState({ commentsByPost: newCommentsByPost });
  }

  private setState(partialState: Partial<CommentsState>): void {
    const currentState = this._state$.value;
    const newState = { ...currentState, ...partialState };
    this._state$.next(newState);
  }

  destroy(): void {
    this._state$.complete();
    this._loadComments$.complete();
  }
}

export const commentsStore = new CommentsStore();