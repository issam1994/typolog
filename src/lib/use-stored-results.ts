"use client";

import { useMemo } from "react";
import { useSyncExternalStore } from "react";
import type { StoredResult } from "@/types/quiz";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

export function useStoredResult(testSlug: string): StoredResult | null {
  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(`typolog_result:${testSlug}`),
    () => null,
  );
  return useMemo(() => (raw ? (JSON.parse(raw) as StoredResult) : null), [raw]);
}

export function useAllStoredResults(): Record<string, StoredResult> {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => {
      const out: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith("typolog_result:")) {
          const v = localStorage.getItem(k);
          if (v) out[k.slice("typolog_result:".length)] = v;
        }
      }
      return JSON.stringify(out);
    },
    () => "{}",
  );
  return useMemo(() => {
    const out: Record<string, StoredResult> = {};
    const entries = JSON.parse(snapshot) as Record<string, string>;
    for (const [slug, v] of Object.entries(entries)) {
      out[slug] = JSON.parse(v) as StoredResult;
    }
    return out;
  }, [snapshot]);
}
