import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, catchError, tap, distinctUntilChanged } from 'rxjs/operators';
import { fetchUser, fetchUsers } from '../services/api';
import type { User } from '../types/api';
import type { UsersState } from './types';

/**
 * Users Store using RxJS (replaces Redux actions/reducers pattern)
 * 
 * Manages user data with caching to avoid duplicate API calls
 */
class UsersStore {
  private readonly _state$ = new BehaviorSubject<UsersState>({
    users: {},
    loading: false,
    error: null,
  });

  // Subjects for triggering different user loading actions
  private readonly _loadUser$ = new BehaviorSubject<number | null>(null);
  private readonly _loadAllUsers$ = new BehaviorSubject<void>(undefined);

  constructor() {
    this.initializeUserLoader();
    this.initializeAllUsersLoader();
  }

  get state$(): Observable<UsersState> {
    return this._state$.asObservable().pipe(distinctUntilChanged());
  }

  get currentState(): UsersState {
    return this._state$.value;
  }

  // Action methods
  loadUser(userId: number): void {
    // Check if user is already cached
    if (this.currentState.users[userId]) {
      return; // User already loaded
    }
    this._loadUser$.next(userId);
  }

  loadAllUsers(): void {
    this._loadAllUsers$.next();
  }

  // Get user by ID (synchronous access to cached data)
  getUser(userId: number): User | null {
    return this.currentState.users[userId] || null;
  }

  // Observable for a specific user
  getUser$(userId: number): Observable<User | null> {
    return this.state$.pipe(
      map(state => state.users[userId] || null),
      distinctUntilChanged()
    );
  }

  private initializeUserLoader(): void {
    this._loadUser$
      .pipe(
        tap(() => this.setState({ loading: true, error: null })),
        switchMap(userId => {
          if (userId === null) return of(null);
          
          return of(null).pipe(
            switchMap(() => fetchUser(userId)),
            map(user => ({ user, loading: false, error: null })),
            catchError(error => of({
              user: null,
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to load user'
            }))
          );
        })
      )
      .subscribe(result => {
        if (result?.user) {
          this.addUser(result.user);
        }
        this.setState({ loading: result?.loading || false, error: result?.error || null });
      });
  }

  private initializeAllUsersLoader(): void {
    this._loadAllUsers$
      .pipe(
        tap(() => this.setState({ loading: true, error: null })),
        switchMap(() =>
          of(null).pipe(
            switchMap(() => fetchUsers()),
            map(users => ({ users, loading: false, error: null })),
            catchError(error => of({
              users: [],
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to load users'
            }))
          )
        )
      )
      .subscribe(result => {
        if (result.users) {
          const usersMap = result.users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
          }, {} as Record<number, User>);
          this.setState({ users: usersMap, loading: false, error: null });
        } else {
          this.setState({ loading: result.loading, error: result.error });
        }
      });
  }

  private addUser(user: User): void {
    const currentState = this._state$.value;
    const newUsers = { ...currentState.users, [user.id]: user };
    this.setState({ users: newUsers });
  }

  private setState(partialState: Partial<UsersState>): void {
    const currentState = this._state$.value;
    const newState = { ...currentState, ...partialState };
    this._state$.next(newState);
  }

  destroy(): void {
    this._state$.complete();
    this._loadUser$.complete();
    this._loadAllUsers$.complete();
  }
}

export const usersStore = new UsersStore();