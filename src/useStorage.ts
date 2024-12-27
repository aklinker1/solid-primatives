/**
 * Utils for persisting data to storage.
 * @module
 */
import { type MaybeRefOrAccessor, toValue } from "./toValue.ts";
import type { Setter } from "./setter.ts";
import { type Accessor, createSignal } from "solid-js";
import { useThrottle } from "./useThrottle.ts";

/** The generic storage interface used by `useStorage`. */
export interface SolidStorage {
  /** Get a value from storage. Must return JSON serializable objects. */
  getValue(key: string): any | null;
  /** Sets a value in storage. Must support all JSON objects. */
  setValue(key: string, value: any | null): void;
}

/**
 * `useStorage` creates a signal from a value in storage.
 */
export function useStorage<T>(
  storage: SolidStorage,
  key: MaybeRefOrAccessor<string>,
  defaultValue: MaybeRefOrAccessor<T>,
): [Accessor<T>, Setter<T>] {
  const getItem = (): T => {
    try {
      return storage.getValue(toValue(key)) ?? toValue(defaultValue);
    } catch (err) {
      console.warn("Failed to get value from storage:", err);
      return toValue(defaultValue);
    }
  };
  const setItem = useThrottle((value: T): void => {
    try {
      storage.setValue(toValue(key), value);
    } catch (err) {
      console.warn("Failed to set value in storage:", err);
    }
  });

  const [value, _setValue] = createSignal(getItem());
  const setValue = (value: T) => {
    _setValue(value as any);
    setItem(value);
  };

  return [value, setValue] as const;
}
