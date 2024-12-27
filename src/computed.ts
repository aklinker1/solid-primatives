/**
 * Solid JS version to Vue's `computed` utility.
 * @module
 */

import { createMemo } from "solid-js";
import type { Ref } from "./ref.ts";
import { signalToShallowRef } from "./shallowRef.ts";

/** A readonly computed `Ref`. */
export type ComputedRef<T> = { value: Readonly<T> };
/** A computed `Ref` that defines custom logic when setting the value. */
export type WritableComputedRef<T> = { value: T };

/**
 * `computed` creates a readonly, memoized `Ref`. It's the same as `createMemo`, but it returns a `Ref` instead.
 *
 * @example
 * ```ts
 * const lowercase = computed(() => string.toLowerCase());
 * ```
 */
export function computed<T>(def: () => T): ComputedRef<T>;
/**
 * `computed` creates a writable ref based on another `Ref`/`Signal`. Useful for type conversions.
 *
 * Because no state is kept in-memory, this is not memoized.
 *
 * @example
 * ```ts
 * const number = ref(1);
 * const string = computed<string>({
 *   get() {
 *     return String(number.value);
 *   },
 *   set(value) {
 *     number.value = Number(value);
 *   },
 * })
 * ```
 */
export function computed<T>(
  def: { get(): T; set(value: T): void },
): Ref<T>;
export function computed<T>(
  def: (() => T) | { get(): T; set(value: T): void },
): Ref<T> {
  if ("get" in def && "set" in def) {
    return signalToShallowRef([def.get, (value) => def.set(value)]);
  }

  const get = createMemo(def);
  return Object.defineProperty(
    { __ref: true } as unknown,
    "value",
    { get: get, writable: false },
  ) as Ref<T>;
}
