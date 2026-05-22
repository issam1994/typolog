import type { Scorer } from "./types";

// Likert questions, each tagged to one of 8 cognitive function traits (ni, ne, si, se, ti, te, fi, fe).
// Archetype code = top 4 functions by score, e.g. 'NiTeFiSe'.
export const cognitiveStack: Scorer = ({
  traits,
  questions,
  answers,
  likertMaxValue,
}) => {
  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};
  traits.forEach((t) => {
    sums[t.slug] = 0;
    counts[t.slug] = 0;
  });

  for (const q of questions) {
    if (q.kind !== "likert") continue;
    const v = answers[q.id];
    if (v === undefined) continue;
    const trait = traits.find((t) => t.id === q.trait_id);
    if (!trait) continue;
    const val = q.reverse_keyed ? likertMaxValue + 1 - v : v;
    sums[trait.slug] += val;
    counts[trait.slug] += 1;
  }

  const scores: Record<string, number> = {};
  for (const t of traits) {
    const c = counts[t.slug];
    scores[t.slug] =
      c > 0 ? Math.round((sums[t.slug] / (c * likertMaxValue)) * 100) : 0;
  }

  // Top 4 functions ordered by score descending; capitalize each (ni → Ni)
  const stack = [...traits]
    .sort((a, b) => (scores[b.slug] ?? 0) - (scores[a.slug] ?? 0))
    .slice(0, 4)
    .map((t) => t.slug.charAt(0).toUpperCase() + t.slug.slice(1));

  const archetypeCode = stack.length === 4 ? stack.join("") : null;
  return { scores, archetypeCode };
};
