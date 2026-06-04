import type {
  Test,
  Trait,
  Question,
  AnswerMap,
  ScoringResult,
} from "@/types/quiz";

export type ScoringInput = {
  test: Test;
  traits: Trait[];
  questions: Question[];
  answers: AnswerMap;
  likertMaxValue: number;
};

export type Scorer = (input: ScoringInput) => ScoringResult;
