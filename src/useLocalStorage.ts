/**
 * Utils for working with `localStorage`.
 * @module
 */
import type { Accessor } from "solid-js";
import type { Setter } from "./setter.ts";
import { type SolidStorage, useStorage } from "./useStorage.ts";
import type { MaybeRefOrAccessor } from "./toValue.ts";

/** Alias for `useStorage` with `localStorage`. */
export function useLocalStorage<T>(
  key: MaybeRefOrAccessor<string>,
  defaultValue: MaybeRefOrAccessor<T>,
): [Accessor<T>, Setter<T>] {
  return useStorage(localSolidStorage, key, defaultValue);
}

export const localSolidStorage: SolidStorage = {
  [Symbol.name]: "localSolidStorage",
  getValue(key) {
    const str = localStorage.getItem(key);
    return str == null ? null : JSON.parse(str);
  },
  setValue(key, value) {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  },
};
