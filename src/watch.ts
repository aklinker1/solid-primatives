/**
 * Watch for changes to values.
 * @module
 */
import { type Accessor, createEffect, createSignal } from "solid-js";
import { dequal } from "npm:dequal@2/lite";
import type { Ref } from "./ref.ts";
import { toValue } from "./toValue.ts";

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
  value: Accessor<T> | Ref<T>,
  cb: (newValue: T, oldValue: T) => void,
  options?: WatchOptions,
): void;
/**
 * Watch for an accessor's value to change, and call the callback. Old value is `undefined` the first time the callback is executed.
 */
export function watch<T>(
  value: Accessor<T> | Ref<T>,
  cb: (newValue: T, oldValue: T | undefined) => void,
  options: { immediate: true },
): void;
export function watch<T>(
  value: Accessor<T> | Ref<T>,
  cb: (newValue: T, oldValue: T | undefined) => void,
  options?: WatchOptions,
) {
  const [prev, setPrev] = createSignal<T>();

  let ranOnce = false;

  const effect = () => {
    if (!options?.immediate && !ranOnce) {
      ranOnce = true;
      return;
    }

    const oldValue = prev();
    const newValue = toValue(value);
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
