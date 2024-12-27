/**
 * Watch for changes, but provide a way to ignore changes in the watcher.
 * @module
 */
import { type Accessor, createSignal } from "solid-js";
import { watch, type WatchOptions } from "./watch.ts";
import type { Ref } from "./ref.ts";

/**
 * Same as `watch`, but returns utils for ignoring changes to the watched value.
 */
export function watchIgnorable<T>(
  value: Accessor<T> | Ref<T>,
  cb: (newValue: T, oldValue: T) => void,
  options?: WatchOptions,
): WatchIgnorableReturn;
export function watchIgnorable<T>(
  value: Accessor<T> | Ref<T>,
  cb: (newValue: T, oldValue: T | undefined) => void,
  options: { immediate: true },
): WatchIgnorableReturn;
export function watchIgnorable<T>(
  value: Accessor<T> | Ref<T>,
  cb: (newValue: T, oldValue: T | undefined) => void,
  options?: WatchOptions,
): WatchIgnorableReturn {
  const [ignoring, setIgnoring] = createSignal(false);
  watch(value, (newValue, oldValue) => {
    if (ignoring()) return;
    cb(newValue, oldValue);
  }, options);

  return {
    ignoreUpdates: (cb) => {
      try {
        setIgnoring(true);
        cb();
      } finally {
        setIgnoring(false);
      }
    },
  };
}

/** Returned from `watchIgnorable` */
export interface WatchIgnorableReturn {
  /** Any state updated in `cb` will not trigger the watcher. */
  ignoreUpdates(cb: () => void): void;
}
