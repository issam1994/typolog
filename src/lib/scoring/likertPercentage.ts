import type { Scorer } from "./types";

export const likertPercentage: Scorer = ({
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
    const raw = answers[q.id];
    if (raw === undefined) continue;
    const trait = traits.find((t) => t.id === q.trait_id);
    if (!trait) continue;
    const v = q.reverse_keyed ? likertMaxValue + 1 - raw : raw;
    sums[trait.slug] += v;
    counts[trait.slug] += 1;
  }

  const scores: Record<string, number> = {};
  for (const t of traits) {
    const c = counts[t.slug];
    scores[t.slug] =
      c > 0 ? Math.round((sums[t.slug] / (c * likertMaxValue)) * 100) : 0;
  }

  return { scores, archetypeCode: null };
};
