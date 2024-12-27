/**
 * Utils for working with `sessionStorage`.
 * @module
 */
import type { Accessor } from "solid-js";
import type { Setter } from "./setter.ts";
import { type SolidStorage, useStorage } from "./useStorage.ts";
import type { MaybeRefOrAccessor } from "./toValue.ts";

/** Alias for `useStorage` with `sessionStorage`. */
export function useSessionStorage<T>(
  key: MaybeRefOrAccessor<string>,
  defaultValue: MaybeRefOrAccessor<T>,
): [Accessor<T>, Setter<T>] {
  return useStorage(sessionSolidStorage, key, defaultValue);
}

export const sessionSolidStorage: SolidStorage = {
  [Symbol.name]: "sessionSolidStorage",
  getValue(key) {
    const str = sessionStorage.getItem(key);
    return str == null ? null : JSON.parse(str);
  },
  setValue(key, value) {
    if (value == null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(value));
  },
};
