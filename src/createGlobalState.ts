/**
 * Manage global state.
 * @module
 */
import { createRoot } from "solid-js";

/**
 * Keep states in the global scope to be reusable across Solid apps/components.
 * @param stateFactory A factory function to create the state
 */
export function createGlobalStateUnstable<Fn extends (...args: any[]) => any>(
  stateFactory: Fn,
): Fn {
  let initialized = false;
  let state: ReturnType<Fn> | undefined;

  return ((...args) => {
    if (!initialized) {
      createRoot((_dispose) => {
        state = stateFactory(...args);
        initialized = true;
      });
    }
    return state;
  }) as Fn;
}
