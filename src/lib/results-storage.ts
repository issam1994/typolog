import type { StoredResult } from "@/types/quiz";

const key = (slug: string) => `typolog_result:${slug}`;

export function saveResult(testSlug: string, data: StoredResult): void {
  try {
    localStorage.setItem(key(testSlug), JSON.stringify(data));
  } catch {}
}

export function loadResult(testSlug: string): StoredResult | null {
  try {
    const raw = localStorage.getItem(key(testSlug));
    return raw ? (JSON.parse(raw) as StoredResult) : null;
  } catch {
    return null;
  }
}

export function loadAllResults(): Record<string, StoredResult> {
  const results: Record<string, StoredResult> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("typolog_result:")) {
        const slug = k.slice("typolog_result:".length);
        const result = loadResult(slug);
        if (result) results[slug] = result;
      }
    }
  } catch {}
  return results;
}
