import type { Scorer } from "./types";

// Likert questions, each tagged to one of 9 type traits.
// Archetype code = the slug of the highest-scoring trait, with 'type_' prefix stripped.
export const enneagramDominant: Scorer = ({
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

  const top = [...traits].sort(
    (a, b) => (scores[b.slug] ?? 0) - (scores[a.slug] ?? 0),
  )[0];
  const archetypeCode = top ? top.slug.replace(/^type_/, "") : null;

  return { scores, archetypeCode };
};
