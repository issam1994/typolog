export type QuestionKind = "likert" | "forced_choice";
export type ScoringStrategy =
  | "likert_percentage"
  | "mbti_dichotomy"
  | "enneagram_dominant"
  | "cognitive_stack"
  | "psychosophy_stack";
export type ResultTemplate =
  | "bars"
  | "mbti_code"
  | "enneagram_type"
  | "cognitive_stack"
  | "psychosophy_stack";

export type Test = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  question_kind: "likert" | "forced_choice" | "mixed";
  scoring_strategy: ScoringStrategy;
  result_template: ResultTemplate;
  is_published: boolean;
  sort_order: number;
  estimated_minutes: number;
};

export type Trait = {
  id: string;
  test_id: string;
  slug: string;
  label: string;
  description: string;
  polarity: string | null;
  sort_order: number;
  updated_at: string;
};

export type QuestionOption = {
  id: string;
  question_id: string;
  label: string;
  value: number;
  trait_id: string | null;
  weight: number;
  sort_order: number;
};

type BaseQuestion = {
  id: string;
  test_id: string;
  text: string;
  sort_order: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  options: QuestionOption[];
};

export type LikertQuestion = BaseQuestion & {
  kind: "likert";
  trait_id: string;
  reverse_keyed: boolean;
};

export type ForcedChoiceQuestion = BaseQuestion & {
  kind: "forced_choice";
  trait_id: null;
};

export type Question = LikertQuestion | ForcedChoiceQuestion;

export type LikertOption = {
  label: string;
  value: number;
};

export type Archetype = {
  id: string;
  test_id: string;
  code: string;
  label: string;
  description: string;
  long_form: string;
  sort_order: number;
};

export type AnswerMap = Record<string, number>;
export type ScoreMap = Record<string, number>;

export type ScoringResult = {
  scores: ScoreMap;
  archetypeCode: string | null;
};

export type Submission = {
  id: string;
  test_id: string;
  submitted_at: string;
  answers: AnswerMap;
  scores: ScoreMap;
  archetype_code: string | null;
};
