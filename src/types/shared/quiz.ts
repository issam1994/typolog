export type Question = {
  id: string;
  text: string;
  trait_id: string;
  sort_order: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Trait = {
  id: string;
  label: string;
  description: string;
  sort_order: number;
  updated_at: string;
};

export type LikertOption = {
  label: string;
  value: number;
};

export type Submission = {
  id: string;
  submitted_at: string;
  answers: Record<string, number>;
  scores: Record<string, number>;
};
