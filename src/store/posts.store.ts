import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, catchError, tap, distinctUntilChanged } from 'rxjs/operators';
import { fetchPosts, fetchPostsByUser } from '../services/api';
import type { PostsState } from './types';

/**
 * Posts Store using RxJS (replaces Redux actions/reducers pattern)
 * 
 * Instead of Redux pattern:
 * - Actions: { type: 'LOAD_POSTS', type: 'LOAD_POSTS_SUCCESS', etc. }
 * - Reducer: (state, action) => newState
 * 
 * We use RxJS pattern:
 * - Observables: streams of data
 * - BehaviorSubjects: hold current state
 * - Operators: transform and combine streams
 */
class PostsStore {
  // BehaviorSubject holds the current state (like Redux store)
  private readonly _state$ = new BehaviorSubject<PostsState>({
    posts: [],
    loading: false,
    error: null,
  });

  // Private subjects for triggering actions (replaces Redux actions)
  private readonly _loadPosts$ = new BehaviorSubject<void>(undefined);
  private readonly _loadPostsByUser$ = new BehaviorSubject<number | null>(null);

  constructor() {
    this.initializePostsLoader();
    this.initializeUserPostsLoader();
  }

  // Public observable for components to subscribe (replaces useSelector)
  get state$(): Observable<PostsState> {
    return this._state$.asObservable().pipe(distinctUntilChanged());
  }

  // Getter for current state value
  get currentState(): PostsState {
    return this._state$.value;
  }

  // Action methods (replaces Redux action creators)
  loadPosts(): void {
    this._loadPosts$.next();
  }

  loadPostsByUser(userId: number): void {
    this._loadPostsByUser$.next(userId);
  }

  // Private method to set up posts loading stream
  private initializePostsLoader(): void {
    this._loadPosts$
      .pipe(
        tap(() => this.setState({ loading: true, error: null })),
        switchMap(() =>
          of(null).pipe(
            switchMap(() => fetchPosts()),
            map(posts => ({ posts, loading: false, error: null })),
            catchError(error => of({
              posts: [],
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to load posts'
            }))
          )
        )
      )
      .subscribe(newState => this.setState(newState));
  }

  // Private method to set up user posts loading stream
  private initializeUserPostsLoader(): void {
    this._loadPostsByUser$
      .pipe(
        tap(() => this.setState({ loading: true, error: null })),
        switchMap(userId => {
          if (userId === null) return of({ posts: [], loading: false, error: null });
          
          return of(null).pipe(
            switchMap(() => fetchPostsByUser(userId)),
            map(posts => ({ posts, loading: false, error: null })),
            catchError(error => of({
              posts: [],
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to load user posts'
            }))
          );
        })
      )
      .subscribe(newState => this.setState(newState));
  }

  // Helper method to update state (replaces reducer logic)
  private setState(partialState: Partial<PostsState>): void {
    const currentState = this._state$.value;
    const newState = { ...currentState, ...partialState };
    this._state$.next(newState);
  }

  // Cleanup method
  destroy(): void {
    this._state$.complete();
    this._loadPosts$.complete();
    this._loadPostsByUser$.complete();
  }
}

// Export singleton instance (replaces Redux store)
export const postsStore = new PostsStore();