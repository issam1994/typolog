import { getAllQuestions, getAllTraits } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/db/auth";
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  moveQuestion,
} from "./actions";
import DeleteButton from "@/components/admin/DeleteButton";
import type { Question, Trait } from "@/types/shared/quiz";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export const metadata = { title: "Questions — Typolog Admin" };

export default async function QuestionsPage({ searchParams }: Props) {
  await requireAdmin();
  const { error } = await searchParams;
  const [questions, traits] = await Promise.all([
    getAllQuestions(),
    getAllTraits(),
  ]);

  const byTrait = traits.map((trait) => ({
    trait,
    questions: questions.filter((q) => q.trait_id === trait.id),
  }));

  return (
    <div className="px-8 py-8 max-w-4xl">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Questions</h1>
        <span className="text-xs text-muted">{questions.length} active</span>
      </div>

      {error && (
        <p className="text-sm text-danger border border-danger/30 px-4 py-3 mb-6">
          {decodeURIComponent(error)}
        </p>
      )}

      <div className="space-y-10 mb-12">
        {byTrait.map(({ trait, questions: tqs }) => (
          <TraitSection key={trait.id} trait={trait} questions={tqs} />
        ))}
      </div>

      <AddQuestionForm traits={traits} />
    </div>
  );
}

function TraitSection({
  trait,
  questions,
}: {
  trait: Trait;
  questions: Question[];
}) {
  return (
    <section>
      <h2 className="text-xs text-muted tracking-widest uppercase mb-3 pb-2 border-b border-border">
        {trait.label}
      </h2>
      {questions.length === 0 && (
        <p className="text-xs text-muted py-2">No questions yet.</p>
      )}
      <div className="space-y-1">
        {questions.map((q, idx) => (
          <QuestionRow
            key={q.id}
            question={q}
            isFirst={idx === 0}
            isLast={idx === questions.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

function QuestionRow({
  question,
  isFirst,
  isLast,
}: {
  question: Question;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <details className="group border border-border/50 hover:border-border transition-colors">
      <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer list-none">
        <span className="flex gap-1 shrink-0">
          <form action={moveQuestion}>
            <input type="hidden" name="id" value={question.id} />
            <input type="hidden" name="direction" value="up" />
            <button
              type="submit"
              disabled={isFirst}
              className="px-1.5 py-0.5 text-xs text-muted hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              title="Move up"
            >
              ↑
            </button>
          </form>
          <form action={moveQuestion}>
            <input type="hidden" name="id" value={question.id} />
            <input type="hidden" name="direction" value="down" />
            <button
              type="submit"
              disabled={isLast}
              className="px-1.5 py-0.5 text-xs text-muted hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              title="Move down"
            >
              ↓
            </button>
          </form>
        </span>
        <span className="flex-1 text-sm text-white/80">{question.text}</span>
        <span className="text-xs text-muted shrink-0 group-open:rotate-180 transition-transform">
          ▾
        </span>
      </summary>

      <div className="px-4 pb-4 pt-2 border-t border-border/50">
        <EditQuestionForm question={question} />
      </div>
    </details>
  );
}

function EditQuestionForm({ question }: { question: Question }) {
  return (
    <div className="space-y-3">
      <form action={updateQuestion} className="space-y-3">
        <input type="hidden" name="id" value={question.id} />
        <textarea
          name="text"
          defaultValue={question.text}
          rows={2}
          required
          className="w-full bg-transparent border border-border px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-white/60 transition-colors"
        />
        <div className="flex gap-3 items-center justify-between">
          <button
            type="submit"
            className="px-4 py-2 text-xs bg-white text-black hover:bg-white/90 transition-colors"
          >
            Save
          </button>
        </div>
      </form>

      <DeleteButton id={question.id} action={deleteQuestion} />
    </div>
  );
}

function AddQuestionForm({ traits }: { traits: Trait[] }) {
  return (
    <div className="border-t border-border pt-8">
      <h2 className="text-xs text-muted tracking-widest uppercase mb-4">
        Add Question
      </h2>
      <form action={createQuestion} className="space-y-4 max-w-xl">
        <textarea
          name="text"
          placeholder="Question text…"
          rows={2}
          required
          className="w-full bg-transparent border border-border px-4 py-3 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/60 transition-colors"
        />
        <div className="flex gap-3 items-center">
          <select
            name="trait_id"
            required
            className="bg-black border border-border px-4 py-3 text-sm text-white focus:outline-none focus:border-white/60 transition-colors"
          >
            <option value="">Trait…</option>
            {traits.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-5 py-3 text-sm bg-white text-black hover:bg-white/90 transition-colors"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
