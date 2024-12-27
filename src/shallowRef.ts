/**
 * Create shallow references to value who's deep values cannot be updated.
 */
import { createSignal } from "solid-js";
import type { Ref } from "./ref.ts";

/**
 * Creates a shallow ref.
 */
export function shallowRef<T>(): Ref<T | undefined>;
export function shallowRef<T>(value: T): Ref<T>;
export function shallowRef<T>(value?: T): Ref<T> {
  return signalToShallowRef<T>(createSignal<T>(value as T));
}

/** A value that might be a reference or it might just be a value. */
export type MaybeRef<T> = T | Ref<T>;

/** Convert a signal to a shallow reference. */
export function signalToShallowRef<T>(
  [get, set]: [() => T, (value: T) => void],
): Ref<T> {
  return Object.defineProperty(
    { __ref: true } as unknown,
    "value",
    { get, set },
  ) as Ref<T>;
}
