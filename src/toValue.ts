/**
 * Helpers for getting the value of accessors.
 * @module
 */
import type { Accessor } from "solid-js";
import type { Ref } from "./ref.ts";

/**
 * Contains either an accessor or value.
 */
export type MaybeAccessor<T> = T | Accessor<T>;

/**
 * Contains either a ref, accessor, or value.
 */
export type MaybeRefOrAccessor<T> = T | Ref<T> | Accessor<T>;

/** `isAccessor` returns true when the value is an `Accessor`. */
export function isAccessor<T>(
  value: MaybeRefOrAccessor<T>,
): value is Accessor<T> {
  return typeof value === "function" && value.length === 0;
}
/** `isRef` returns true when the value is an `Accessor`. */
export function isRef<T>(value: MaybeRefOrAccessor<T>): value is Ref<T> {
  return (value as any).__ref === true;
}

/**
 * Returns the value of the `Accessor`/`Ref`, or if the value is neither, returns the value as-is.
 *
 * @example
 * ```ts
 * toValue("abc")       // "abc"
 * toValue(() => "abc") // "abc"
 * toValue(ref("abc"))  // "abc"
 * ```
 */
export function toValue<T>(value: MaybeRefOrAccessor<T>): T {
  return isAccessor(value) ? value() : isRef(value) ? value.value : value;
}
