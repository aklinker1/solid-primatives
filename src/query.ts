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
} from "solid-js";
import type { MaybeAccessor } from "./toValue.ts";
import { useRequiredContext } from "./useRequiredContext.ts";
import { toValue } from "./toValue.ts";
import { watch } from "./watch.ts";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";

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
  const [store, setStore] = createStore<Record<string, QueryData>>({});

  const invalidateQuery = (key: QueryKey) => {
    globalThis?.dispatchEvent?.(
      new CustomEvent(INVALIDATE_EVENT, { detail: serializeKey(key) }),
    );
  };

  return {
    store,
    setStore,
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
  /**
   * Contains details about existing queries.
   */
  store: Store<Record<string, QueryData>>;
  /**
   * Setter for updating query data.
   */
  setStore: SetStoreFunction<Record<string, QueryData>>;
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

  const fetch = (fetchOptions: { useCache: boolean }) => {
    if (toValue(options?.enabled) === false) return Promise.resolve(undefined);

    const keyStr = serializeKey(key);
    if (fetchOptions.useCache) {
      const cached = client.store[keyStr];
      if (cached != null) {
        if (cached.error) return Promise.reject(cached.error as Error);
        else return Promise.resolve(cached.data as Value);
      }
    }

    client.setStore(keyStr, (existing) => ({
      ...existing,
      status: "loading",
      err: undefined,
    }));

    return Promise.resolve(query()).then(
      (data) => {
        client.setStore(keyStr, { status: "success", data });
        options?.onSuccess?.(data, client);
        return data;
      },
      (error) => {
        client.setStore(keyStr, { status: "error", error });
        options?.onError?.(error, client);
        throw error;
      },
    );
  };

  // Reload on key change
  watch(() => toValue(key), () => void fetch({ useCache: true }), {
    deep: true,
  });

  // Refetch when enabled flag changes
  watch(() => toValue(options?.enabled), () => void fetch({ useCache: true }));

  // Reload on invalidation
  const onInvalidationMessage = (e: Event) => {
    const currentKey = serializeKey(key);
    const invalidatedKey = (e as CustomEvent<string>).detail;
    if (currentKey.startsWith(invalidatedKey)) void fetch({ useCache: false });
  };
  onMount(() =>
    globalThis?.addEventListener?.(INVALIDATE_EVENT, onInvalidationMessage)
  );
  onCleanup(() =>
    globalThis?.removeEventListener?.(INVALIDATE_EVENT, onInvalidationMessage)
  );

  // Initial query
  onMount(() => void fetch({ useCache: true }));

  return {
    data: () => client.store[serializeKey(key)]?.data as Value | undefined,
    status: () => client.store[serializeKey(key)]?.status ?? "idle",
    error: () => client.store[serializeKey(key)]?.error as Err | undefined,
    refetch: () => fetch({ useCache: false }),
    isLoading: () => client.store[serializeKey(key)]?.status === "loading",
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
  enabled?: MaybeAccessor<boolean>;
}

export interface QueryData {
  status: AsyncStatus;
  error: unknown | undefined;
  data: unknown | undefined;
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
  refetch: () => Promise<Value | undefined>;
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

  const [data, setData] = createSignal<Value>();
  const [status, setStatus] = createSignal<AsyncStatus>("idle");
  const [error, setError] = createSignal<Err>();

  const refetch = (...args: Args) => {
    setStatus("loading");
    setError(undefined);
    return mutate(...args).then(
      (res) => {
        setStatus("success");
        setData(() => res);
        if (options?.invalidate?.length) {
          client.invalidateQueries(options.invalidate);
        }
        options?.onSuccess?.(res, client);
        return res;
      },
      (err) => {
        setStatus("error");
        setError(() => err);
        options?.onError?.(err, client);
        throw err;
      },
    );
  };

  return {
    mutate: refetch,
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
