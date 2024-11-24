/**
 * Helpers for getting the value of accessors.
 * @module
 */
import type { Accessor } from "solid-js";

/**
 * Contains either an accessor or a value.
 */
export type MaybeAccessor<T> = Accessor<T> | T;

function isAccessor<T>(value: MaybeAccessor<T>): value is Accessor<T> {
  return typeof value === "function" && value.length === 0;
}

/**
 * Resolve the accessor's value or returns the value for non-accessors
 * @example
 * ```ts
 * toValue("abc")       // "abc"
 * toValue(() => "abc") // "abc"
 * ```
 */
export function toValue<T>(value: MaybeAccessor<T>): T {
  return isAccessor(value) ? value() : value;
}
