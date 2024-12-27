import { type MaybeRefOrAccessor, toValue } from "./toValue.ts";

/**
 * `useThrottle` limits how often a function can be called.
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  interval: MaybeRefOrAccessor<number> = 100,
): T {
  let waiting = false;
  return ((...args) => {
    if (waiting) return;
    fn(...args);
    waiting = true;
    setTimeout(() => {
      waiting = false;
    }, toValue(interval));
  }) as T;
}
