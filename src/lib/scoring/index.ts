import type { ScoringStrategy } from "@/types/shared/quiz";
import type { Scorer } from "./types";
import { likertPercentage } from "./likertPercentage";
import { mbtiDichotomy } from "./mbtiDichotomy";
import { enneagramDominant } from "./enneagramDominant";
import { cognitiveStack } from "./cognitiveStack";
import { psychosophyStack } from "./psychosophyStack";

const REGISTRY: Record<ScoringStrategy, Scorer> = {
  likert_percentage: likertPercentage,
  mbti_dichotomy: mbtiDichotomy,
  enneagram_dominant: enneagramDominant,
  cognitive_stack: cognitiveStack,
  psychosophy_stack: psychosophyStack,
};

export function getScorer(strategy: ScoringStrategy): Scorer {
  const scorer = REGISTRY[strategy];
  if (!scorer) throw new Error(`Unknown scoring strategy: ${strategy}`);
  return scorer;
}
