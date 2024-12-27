/**
 * Create hooks that are only called once.
 * @module
 */
import { createRoot, onCleanup } from "solid-js";

/**
 * Make a composable function reusable across multiple Solid apps/components.
 */
export function createSharedHookUnstable<Fn extends (...args: any[]) => any>(
  hook: Fn,
): Fn {
  let subscribers = 0;
  let dispose: (() => void) | undefined;
  let state: ReturnType<Fn> | undefined;

  const unsubscribe = () => {
    subscribers -= 1;
    if (subscribers <= 0) {
      dispose?.();
      state = undefined;
      dispose = undefined;
    }
  };

  return ((...args) => {
    subscribers += 1;

    if (!dispose) {
      createRoot((_dispose) => {
        dispose = _dispose;
        state = hook(...args);
      });
    }
    onCleanup(unsubscribe);

    return state;
  }) as Fn;
}
