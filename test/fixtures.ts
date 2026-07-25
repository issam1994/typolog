import type {
  Archetype,
  ForcedChoiceQuestion,
  LikertQuestion,
  QuestionOption,
  Submission,
  Test,
  Trait,
} from "@/types/quiz";

// Deterministic factory builders for domain types. Every builder fills sensible
// defaults and accepts an `overrides` object, so tests only state what matters.

let seq = 0;
const uid = (prefix: string) => `${prefix}_${(++seq).toString(36)}`;

export function makeTest(overrides: Partial<Test> = {}): Test {
  return {
    id: uid("test"),
    slug: "sample-test",
    name: "Sample Test",
    tagline: "A sample",
    description: "A sample test",
    question_kind: "likert",
    scoring_strategy: "likert_percentage",
    result_template: "bars",
    is_published: true,
    sort_order: 1,
    estimated_minutes: 5,
    ...overrides,
  };
}

export function makeTrait(overrides: Partial<Trait> = {}): Trait {
  return {
    id: uid("trait"),
    test_id: "test_1",
    slug: "trait",
    label: "Trait",
    description: "",
    polarity: null,
    sort_order: 1,
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function makeQuestionOption(
  overrides: Partial<QuestionOption> = {},
): QuestionOption {
  return {
    id: uid("opt"),
    question_id: "q_1",
    label: "Option",
    value: 1,
    trait_id: null,
    weight: 1,
    sort_order: 1,
    ...overrides,
  };
}

export function makeLikertQuestion(
  overrides: Partial<LikertQuestion> = {},
): LikertQuestion {
  return {
    id: uid("q"),
    test_id: "test_1",
    text: "A likert question",
    sort_order: 1,
    deleted_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    options: [],
    kind: "likert",
    trait_id: "trait_1",
    reverse_keyed: false,
    ...overrides,
  };
}

export function makeForcedChoiceQuestion(
  overrides: Partial<ForcedChoiceQuestion> = {},
): ForcedChoiceQuestion {
  return {
    id: uid("q"),
    test_id: "test_1",
    text: "A forced choice question",
    sort_order: 1,
    deleted_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    options: [],
    kind: "forced_choice",
    trait_id: null,
    ...overrides,
  };
}

export function makeArchetype(overrides: Partial<Archetype> = {}): Archetype {
  return {
    id: uid("arch"),
    test_id: "test_1",
    code: "CODE",
    label: "The Archetype",
    description: "A short description",
    long_form: "A longer description",
    sort_order: 1,
    ...overrides,
  };
}

export function makeSubmission(
  overrides: Partial<Submission> = {},
): Submission {
  return {
    id: uid("sub"),
    test_id: "test_1",
    submitted_at: "2026-01-01T00:00:00.000Z",
    answers: {},
    scores: {},
    archetype_code: null,
    ...overrides,
  };
}
