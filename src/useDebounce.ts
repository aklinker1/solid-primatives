/**
 * Slow down calls to a function.
 * @module
 */
import { type MaybeRefOrAccessor, toValue } from "./toValue.ts";

/**
 * `useDebounce` prevents a function from being called multiple times in a row.
 */
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  interval: MaybeRefOrAccessor<number> = 100,
): T {
  let timeout: ReturnType<typeof setTimeout>;
  return ((...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, toValue(interval));
  }) as T;
}
