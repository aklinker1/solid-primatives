import type { Component, ParentProps } from "npm:solid-js@1";

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
