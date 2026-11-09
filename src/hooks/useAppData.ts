import { useSyncExternalStore } from "react";
import { getData, getRole, subscribe } from "@/services/storage";
import type { AppData, Client, Role } from "@/types";

// Server render has no localStorage: return null and let layouts show a loader.
export function useAppData(): AppData | null {
  return useSyncExternalStore(subscribe, getData, () => null);
}

export function useRole(): Role | null | undefined {
  return useSyncExternalStore(
    subscribe,
    getRole,
    () => undefined, // undefined = not yet known (SSR)
  );
}

export function useActiveClient(): Client | null {
  const data = useAppData();
  if (!data) return null;
  return data.clients.find((c) => c.id === data.activeClientId) ?? null;
}
