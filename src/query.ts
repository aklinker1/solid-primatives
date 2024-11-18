/**
 * Utils for managing async data. Includes querying and mutating data.
 *
 * ```tsx
 * // App.tsx
 * import { QueryClientContext, createQueryClient } from 'jsr:@aklinker1/solid-primatives/query';
 * import SomeComponent from './components/SomeComponent';
 *
 * export default () => (
 *   <QueryClientContext.Provider value={createQueryClient()}>
 *     <SomeComponent />
 *   </QueryClientContext.Provider>
 * );
 * ```
 *
 * ```tsx
 * // components/SomeComponent
 * export default () => {
 *   const { data: posts, isLoading, error } = useQuery(
 *     "posts",
 *     () => fetch("/api/posts").then(res => res.json());
 *   );
 *   const { mutate: createPost } = useMutation(
 *     (post: Post) => fetch("/api/posts", { method: "POST" }),
 *     { invalidate: ["posts"] }
 *   // ...
 * }
 * ```
 *
 * @module
 */

import {
  type Accessor,
  type Context,
  createContext,
  createSignal,
  onCleanup,
  onMount,
} from "npm:solid-js@1";
import type { MaybeAccessor } from "./toValue.ts";
import { useRequiredContext } from "./useRequiredContext.ts";
import { toValue } from "./toValue.ts";
import { watch } from "./watch.ts";
// import { createStore, type Store, type SetStoreFunction } from "npm:solid-js@1/store";

// CLIENT

/** Context containing the app's query client */
export const QueryClientContext: Context<QueryClient | undefined> =
  createContext(undefined, {
    name: "QueryClientContext",
  });

const INVALIDATE_EVENT = "query:invalidate";

/**
 * Create a new query client to provide to the rest of the application.
 */
export function createQueryClient(): QueryClient {
  // const [store, setStore] = createStore<Record<string, unknown>>({})

  const invalidateQuery = (key: QueryKey) => {
    globalThis?.dispatchEvent?.(
      new CustomEvent(INVALIDATE_EVENT, { detail: serializeKey(key) }),
    );
  };

  return {
    // store,
    // setStore,
    invalidateQuery,
    invalidateQueries: (keys) => {
      for (let i = 0; i < keys.length; i++) invalidateQuery(keys[i]);
    },
  };
}

/**
 * The query client is responsible for managing invalidation and shared state.
 */
export interface QueryClient {
  // TODO: Share state between query instances so you don't have to make the same request twice.
  // store: Store<Record<string, unknown>>;
  // setStore: SetStoreFunction<Record<string, unknown>>
  /** Invalidate a single query. */
  invalidateQuery: (key: QueryKey) => void;
  /** Invalidate multiple queries. */
  invalidateQueries: (keys: QueryKey[]) => void;
}

/** Returns the provided query client. */
export function useQueryClient(): QueryClient {
  return useRequiredContext(QueryClientContext);
}

// QUERY

/** Query async data. */
export function useQuery<Value, Err = unknown>(
  key: MaybeAccessor<QueryKey>,
  query: () => Promise<Value>,
  options?: UseQueryOptions<Value, Err>,
): UseQueryReturn<Value, Err> {
  const client = useQueryClient();
  const { fn: refetch, data, status, error } = useAsyncFn<Value, [], Err>(
    query,
    (res) => options?.onSuccess?.(res, client),
    (err) => options?.onError?.(err, client),
  );

  // Reload on key change
  watch(() => toValue(key), () => void refetch(), {
    deep: true,
  });

  // Reload on invalidation
  const onInvalidationMessage = (e: Event) => {
    const currentKey = serializeKey(key);
    const invalidatedKey = (e as CustomEvent<string>).detail;
    if (currentKey.startsWith(invalidatedKey)) void refetch();
  };
  onMount(() =>
    globalThis?.addEventListener?.(INVALIDATE_EVENT, onInvalidationMessage)
  );
  onCleanup(() =>
    globalThis?.removeEventListener?.(INVALIDATE_EVENT, onInvalidationMessage)
  );

  // Initial query
  onMount(refetch);

  return {
    data,
    status,
    error,
    refetch,
    isLoading: () => status() === "loading",
  };
}

/** Key used for invalidation and automatic refetching on change. */
export type QueryKey =
  | Array<string | number | boolean | undefined | null>
  | string
  | number
  | boolean
  | undefined
  | null;

/** Options for `useQuery`. */
export interface UseQueryOptions<Value, Err = unknown> {
  onSuccess?: (value: Value, client: QueryClient) => void;
  onError?: (err: Err, client: QueryClient) => void;
}

/**
 * The status of an async request.
 * - `idle`: Request hasn't been made.
 * - `loading`: Request is in progress.
 * - `error`: Request failed.
 * - `success`: Request finished successfully.
 */
export type AsyncStatus = "idle" | "loading" | "error" | "success";

/**
 * Contains the return value for `useQuery`.
 */
export interface UseQueryReturn<Value, Err = unknown> {
  data: Accessor<Value | undefined>;
  error: Accessor<Err | undefined>;
  status: Accessor<AsyncStatus>;
  isLoading: Accessor<boolean>;
  refetch: () => Promise<Value>;
}

// MUTATION

/**
 * Create a async function that can invalidate queries.
 */
export function useMutation<Value, Args extends unknown[], Err = unknown>(
  mutate: (...args: Args) => Promise<Value>,
  options?: UseMutationOptions<Value, Err>,
): UseMutationReturn<Value, Args, Err> {
  const client = useQueryClient();
  const { fn: wrappedMutate, data, status, error } = useAsyncFn<
    Value,
    Args,
    Err
  >(
    mutate,
    (res) => {
      if (options?.invalidate?.length) {
        client.invalidateQueries(options.invalidate);
      }
      options?.onSuccess?.(res, client);
    },
    (err) => options?.onError?.(err, client),
  );

  return {
    mutate: wrappedMutate,
    data,
    status,
    error,
    isLoading: () => status() === "loading",
  };
}

/** Options for `useMutation`. */
export interface UseMutationOptions<Value, Err = unknown> {
  /** Called after mutation succeeds. */
  onSuccess?: (res: Value, client: QueryClient) => void;
  /** Called if there was an error. */
  onError?: (err: Err, client: QueryClient) => void;
  /** List of query keys to invalidate on success. */
  invalidate?: QueryKey[];
}

/** Return value for `useMutation`. */
export interface UseMutationReturn<
  Value,
  Args extends unknown[],
  Err = unknown,
> {
  data: Accessor<Value | undefined>;
  error: Accessor<Err | undefined>;
  status: Accessor<AsyncStatus>;
  isLoading: Accessor<boolean>;
  mutate: (...args: Args) => Promise<Value>;
}

// Utils

function serializeKey(key: MaybeAccessor<QueryKey>): string {
  const value = toValue(key);
  if (!Array.isArray(value)) return String(value);
  return value.join(" → ");
}

function useAsyncFn<Value, Args extends unknown[], Err = unknown>(
  fn: (...args: Args) => Promise<Value>,
  onSuccess: (res: Value) => void,
  onError: (err: Err) => void,
) {
  const [data, setData] = createSignal<Value>();
  const [status, setStatus] = createSignal<AsyncStatus>("idle");
  const [error, setError] = createSignal<Err>();

  return {
    data,
    status,
    error,
    // NOT async to prevent running code in microtask queue, instead run it as soon as the function is called.
    fn: (...args: Args) => {
      setStatus("loading");
      setError(undefined);
      return fn(...args).then(
        (res) => {
          setStatus("success");
          setData(() => res);
          onSuccess(res);
          return res;
        },
        (err) => {
          setStatus("error");
          setError(() => err);
          onError(err);
          throw err;
        },
      );
    },
  };
}
