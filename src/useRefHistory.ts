/**
 * Track changes to a `Ref` over time.
 * @module
 */
import { createSignal } from "solid-js";
import type { Ref } from "./ref.ts";
import { watchIgnorable } from "./watchIgnorable.ts";
import type { WatchOptions } from "./watch.ts";

/**
 * `useRefHistory` returns an object that tracks changes to the ref.
 */
export function useRefHistoryUnstable<T>(
  ref: Ref<T>,
  options?: WatchOptions,
): UseStateHistoryReturn<T> {
  const [history, setHistory] = createSignal([structuredClone(ref.value)]);
  const [index, setIndex] = createSignal(0);
  const { ignoreUpdates } = watchIgnorable(ref, (newValue) => {
    const newIndex = index() + 1;
    setHistory((
      history,
    ) => [...history.slice(0, newIndex), structuredClone(newValue)]);
    setIndex(newIndex);
  }, options);

  return {
    undo() {
      ignoreUpdates(() => {
        const newIndex = Math.max(index() - 1, 0);
        if (newIndex !== index()) {
          setIndex(newIndex);
          ref.value = structuredClone(history()[newIndex]);
        }
      });
    },
    redo() {
      ignoreUpdates(() => {
        const newIndex = Math.min(index() + 1, history().length - 1);
        if (newIndex !== index()) {
          setIndex(newIndex);
          ref.value = structuredClone(history()[newIndex]);
        }
      });
    },
    canUndo: () => index() > 0,
    canRedo: () => index() < history().length - 1,
    history,
  };
}

export interface UseStateHistoryReturn<T> {
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  history(): T[];
}
