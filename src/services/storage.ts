// Single shared store for all demo data, persisted in localStorage.
// Both roles read the same store, so actions in one role show up in the other.
// Swap this module for a real backend later without changing the UI.
import type { AppData, Role } from "@/types";
import { buildSeedData, DATA_VERSION } from "@/data/seed";

const DATA_KEY = "omatahti:data";
const ROLE_KEY = "omatahti:role";

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: AppData | null = null;
let roleCache: Role | null | undefined;

function emit() {
  listeners.forEach((l) => l());
}

export function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getData(): AppData {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(DATA_KEY);
    const parsed = raw ? (JSON.parse(raw) as AppData) : null;
    if (parsed && parsed.version === DATA_VERSION) {
      cache = parsed;
      return cache;
    }
  } catch {
    // fall through to seed
  }
  cache = buildSeedData();
  window.localStorage.setItem(DATA_KEY, JSON.stringify(cache));
  return cache;
}

export function updateData(fn: (d: AppData) => AppData) {
  cache = fn(getData());
  window.localStorage.setItem(DATA_KEY, JSON.stringify(cache));
  emit();
}

export function resetDemoData() {
  cache = buildSeedData();
  window.localStorage.setItem(DATA_KEY, JSON.stringify(cache));
  emit();
}

export function getRole(): Role | null {
  if (roleCache !== undefined) return roleCache;
  const r = window.localStorage.getItem(ROLE_KEY);
  roleCache = r === "client" || r === "physio" ? r : null;
  return roleCache;
}

export function setRole(role: Role | null) {
  roleCache = role;
  if (role) window.localStorage.setItem(ROLE_KEY, role);
  else window.localStorage.removeItem(ROLE_KEY);
  emit();
}
