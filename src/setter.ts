/**
 * Utils for converting refs to setter functions.
 * @module
 */
import type { Ref } from "./ref.ts";

/**
 * `setter` converts a `Ref` into a `Setter` function. Useful for custom input components.
 *
 * @example
 * ```tsx
 * <MyInput value={ref.value} setValue={setter(ref)} />
 * ```
 */
export function setter<T>(ref: Ref<T>): Setter<T> {
  return (value: T) => {
    ref.value = value;
  };
}

/** Function for setting a value. */
export type Setter<T> = (value: T) => void;
