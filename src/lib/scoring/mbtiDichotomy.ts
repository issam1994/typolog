import type { Scorer } from "./types";

// Expects 4 polarity pairs among traits: e/i, s/n, t/f, j/p.
// Each forced_choice question has 2 options, each option tagged with a trait_id.
// The chosen option's trait slug increments that side's count.
// Archetype code is the winning letter of each pair, first letter wins ties.
export const mbtiDichotomy: Scorer = ({ traits, questions, answers }) => {
  const counts: Record<string, number> = {};
  traits.forEach((t) => {
    counts[t.slug] = 0;
  });

  for (const q of questions) {
    if (q.kind !== "forced_choice") continue;
    const chosen = answers[q.id];
    if (chosen === undefined) continue;
    const opt = q.options.find((o) => o.value === chosen);
    if (!opt?.trait_id) continue;
    const trait = traits.find((t) => t.id === opt.trait_id);
    if (trait) counts[trait.slug] = (counts[trait.slug] ?? 0) + 1;
  }

  // Build polarity pairs from trait.polarity — deduplicate by visiting each pair once
  const seen = new Set<string>();
  const pairs: [string, string][] = [];
  for (const t of traits) {
    if (!t.polarity || seen.has(t.slug) || seen.has(t.polarity)) continue;
    pairs.push([t.slug, t.polarity]);
    seen.add(t.slug);
    seen.add(t.polarity);
  }

  const scores: Record<string, number> = {};
  const codeLetters: string[] = [];

  for (const [a, b] of pairs) {
    const ca = counts[a] ?? 0;
    const cb = counts[b] ?? 0;
    const total = ca + cb;
    scores[a] = total > 0 ? Math.round((ca / total) * 100) : 50;
    scores[b] = 100 - scores[a];
    // First letter of the pair wins ties (deterministic)
    codeLetters.push(ca >= cb ? a.toUpperCase() : b.toUpperCase());
  }

  const archetypeCode = codeLetters.length === 4 ? codeLetters.join("") : null;
  return { scores, archetypeCode };
};
