"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `true` once the component is running on the client.
 *
 * Implemented with `useSyncExternalStore` (rather than a mount effect) so it
 * satisfies React's rules-of-hooks linting and never triggers a cascading
 * render: the server snapshot is `false`, the client snapshot is `true`.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
