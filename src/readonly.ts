/**
 * Utils for creating readonly refs.
 * @module
 */
import type { Ref } from "./ref.ts";

/** `readonly` makes a `Ref` readonly. */
export function readonly<T>(ref: Ref<T>): Readonly<Ref<T>> {
  return Object.defineProperty(
    { __ref: true } as unknown,
    "value",
    { get: () => ref.value, writable: false },
  ) as Ref<T>;
}
