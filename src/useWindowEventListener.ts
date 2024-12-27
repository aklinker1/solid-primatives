/**
 * Listen for window events in components.
 * @module
 */
import { onCleanup, onMount } from "solid-js";

/**
 * Listen for `window` events in components.
 */
export function useWindowEventListener<T extends keyof WindowEventMap>(
  type: T,
  listener: (event: WindowEventMap[T]) => void,
  options?: AddEventListenerOptions,
): void;
export function useWindowEventListener(
  type: string,
  listener: (event: Event) => void,
  options?: AddEventListenerOptions,
): void;
export function useWindowEventListener(
  type: string,
  listener: (event: Event) => void,
  options?: AddEventListenerOptions,
): void {
  onMount(() => globalThis.addEventListener(type, listener, options));
  onCleanup(() => globalThis.removeEventListener(type, listener));
}
