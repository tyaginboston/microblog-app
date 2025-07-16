import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, catchError, tap, distinctUntilChanged, filter } from 'rxjs/operators';
import { fetchPost } from '../services/api';
import { usersStore } from './users.store';
import { commentsStore } from './comments.store';
import type { PostDetailState } from './types';

/**
 * PostDetail Store using RxJS (replaces complex Redux state management)
 * 
 * Demonstrates how RxJS can combine multiple data streams elegantly
 * instead of managing complex Redux action combinations
 */
class PostDetailStore {
  private readonly _state$ = new BehaviorSubject<PostDetailState>({
    post: null,
    comments: [],
    author: null,
    loading: false,
    error: null,
  });

  private readonly _loadPostDetail$ = new BehaviorSubject<number | null>(null);

  constructor() {
    this.initializePostDetailLoader();
  }

  get state$(): Observable<PostDetailState> {
    return this._state$.asObservable().pipe(distinctUntilChanged());
  }

  get currentState(): PostDetailState {
    return this._state$.value;
  }

  // Action method
  loadPostDetail(postId: number): void {
    this._loadPostDetail$.next(postId);
  }

  private initializePostDetailLoader(): void {
    this._loadPostDetail$
      .pipe(
        filter(postId => postId !== null),
        tap(() => this.setState({ loading: true, error: null })),
        switchMap(postId => {
          if (postId === null) return of(null);

          // Load post first, then load related data
          return of(null).pipe(
            switchMap(() => fetchPost(postId)),
            switchMap(post => {
              // Load author and comments in parallel
              usersStore.loadUser(post.userId);
              commentsStore.loadComments(post.id);

              // Combine all data streams
              return combineLatest([
                of(post),
                usersStore.getUser$(post.userId),
                commentsStore.getComments$(post.id),
              ]).pipe(
                map(([postData, author, comments]) => ({
                  post: postData,
                  author,
                  comments,
                  loading: false,
                  error: null,
                }))
              );
            }),
            catchError(error => of({
              post: null,
              author: null,
              comments: [],
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to load post details'
            }))
          );
        })
      )
      .subscribe(newState => {
        if (newState) {
          this.setState(newState);
        }
      });
  }

  private setState(partialState: Partial<PostDetailState>): void {
    const currentState = this._state$.value;
    const newState = { ...currentState, ...partialState };
    this._state$.next(newState);
  }

  destroy(): void {
    this._state$.complete();
    this._loadPostDetail$.complete();
  }
}

export const postDetailStore = new PostDetailStore();