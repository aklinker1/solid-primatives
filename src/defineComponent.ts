import type { Component, ParentProps } from "solid-js";

/**
 * Shortcut for defining a component with types.
 *
 * ```ts
 * export default defineComponent<{ disabled?: boolean }>(props => {
 *   props.disabled;
 *   // ...
 * })
 * ```
 *
 * Optionally set the second type param to `true` to extend `ParentProps`.
 *
 * ```ts
 * export default defineComponent<{ disabled?: boolean }, true>(props => {
 *   return <div>{props.children}</div>
 * })
 * ```
 */
export function defineComponent<
  TProps extends Record<string, unknown> = EmptyProps,
  TParent extends boolean = false,
>(
  component: Component<GetProps<TProps, TParent>>,
): Component<GetProps<TProps, TParent>> {
  return component;
}

type GetProps<TProps, TParent> = TParent extends true ? TProps & ParentProps
  : TProps;

type EmptyProps = Record<string | number | symbol, never>;
