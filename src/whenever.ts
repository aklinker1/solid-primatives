/**
 * Shorthand for watching for a accessor's value to be truthy.
 * @module
 */
import type { Accessor } from "solid-js";
import { watch, type WatchOptions } from "./watch.ts";

/** Call the callback whenever the value changes and is truthy. */
export function whenever<T>(
  test: Accessor<T>,
  cb: (value: T) => void,
  options?: WatchOptions,
): void {
  watch(test, (value) => {
    if (value) cb(value);
  }, options);
}
