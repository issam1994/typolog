import type { Test, Trait, ScoreMap, Archetype } from "@/types/shared/quiz";

export type ResultTemplateProps = {
  test: Test;
  traits: Trait[];
  scores: ScoreMap;
  archetype: Archetype | null;
  archetypeCode: string | null;
};
