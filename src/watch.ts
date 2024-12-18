/**
 * Watch for changes to values.
 * @module
 */
import { type Accessor, createEffect, createSignal } from "npm:solid-js@1";
import { dequal } from "npm:dequal@2/lite";

/** Configuration for how the `watch` function. */
export interface WatchOptions {
  /** Invoke the callback immediately */
  immediate?: boolean;
  /** Use `dequal/lite` to check if the values are equal */
  deep?: boolean;
}

/**
 * Watch for an accessor's value to change, and call the callback.
 */
export function watch<T>(
  value: Accessor<T>,
  cb: (newValue: T, oldValue: T) => void,
  options?: WatchOptions,
): void;
/**
 * Watch for an accessor's value to change, and call the callback. Old value is `undefined` the first time the callback is executed.
 */
export function watch<T>(
  value: Accessor<T>,
  cb: (newValue: T, oldValue: T | undefined) => void,
  options: { immediate: true },
): void;
export function watch<T>(
  value: Accessor<T>,
  cb: (newValue: T, oldValue: T | undefined) => void,
  options?: WatchOptions,
) {
  console.log("Watching...");
  const [prev, setPrev] = createSignal<T>();
  const effect = () => {
    console.log("value changed");
    const oldValue = prev();
    const newValue = value();
    if (options?.deep ? !dequal(oldValue, newValue) : oldValue !== newValue) {
      cb(newValue, oldValue);
    }
    setPrev(prev);
  };
  createEffect(effect);
  if (options?.immediate) {
    effect();
  }
}
