import { useState, useEffect } from 'react';
import { Observable } from 'rxjs';

/**
 * Custom hook to integrate RxJS observables with React components
 * This replaces useSelector from Redux
 * 
 * @param observable$ - RxJS observable to subscribe to
 * @param initialValue - Initial value before first emission
 * @returns Current value from the observable
 */
export function useObservable<T>(observable$: Observable<T>, initialValue: T): T {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const subscription = observable$.subscribe(setValue);
    return () => subscription.unsubscribe();
  }, [observable$]);

  return value;
}

/**
 * Hook specifically for RxJS store state
 * Automatically handles the store pattern
 */
export function useStore<T>(store: { state$: Observable<T>; currentState: T }): T {
  return useObservable(store.state$, store.currentState);
}