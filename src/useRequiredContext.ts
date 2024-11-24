import { type Context, useContext } from "solid-js";

export function useRequiredContext<T>(context: Context<T>): NonNullable<T> {
  const value = useContext(context);
  if (value == null) throw Error(`Context not provided: ${String(context.id)}`);
  return value;
}
