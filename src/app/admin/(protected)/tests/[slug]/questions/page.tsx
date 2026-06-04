import { notFound } from "next/navigation";
import { getTest, getAllQuestions, getAllTraits } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/db/auth";
import DeleteButton from "@/components/admin/DeleteButton";
import {
  createQuestionAction,
  deleteQuestionAction,
  moveQuestionAction,
  updateQuestionAction,
} from "./actions";
import type { Question, Trait } from "@/types/quiz";

export const metadata = { title: "Questions — Typolog Admin" };

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function QuestionsPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { slug } = await params;
  const { error } = await searchParams;
  const test = await getTest(slug);
  if (!test) notFound();

  const [questions, traits] = await Promise.all([
    getAllQuestions(test.id),
    getAllTraits(test.id),
  ]);

  // Group by trait for likert tests; ungrouped list for others
  const likertsGrouped =
    test.question_kind === "likert"
      ? traits.map((trait) => ({
          trait,
          questions: questions.filter(
            (q) => q.kind === "likert" && q.trait_id === trait.id,
          ),
        }))
      : null;
  const forcedChoiceQuestions = questions.filter(
    (q) => q.kind === "forced_choice",
  );

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">
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
        {likertsGrouped
          ? likertsGrouped.map(({ trait, questions: tqs }) => (
              <section key={trait.id}>
                <h2 className="text-xs text-muted tracking-widest uppercase mb-3 pb-2 border-b border-border">
                  {trait.label}
                </h2>
                {tqs.length === 0 && (
                  <p className="text-xs text-muted py-2">No questions yet.</p>
                )}
                <div className="space-y-1">
                  {tqs.map((q, idx) => (
                    <QuestionRow
                      key={q.id}
                      question={q}
                      traits={traits}
                      testSlug={slug}
                      isFirst={idx === 0}
                      isLast={idx === tqs.length - 1}
                    />
                  ))}
                </div>
              </section>
            ))
          : questions.map((q, idx) => (
              <QuestionRow
                key={q.id}
                question={q}
                traits={traits}
                testSlug={slug}
                isFirst={idx === 0}
                isLast={idx === questions.length - 1}
              />
            ))}

        {forcedChoiceQuestions.length > 0 && likertsGrouped && (
          <section>
            <h2 className="text-xs text-muted tracking-widest uppercase mb-3 pb-2 border-b border-border">
              Forced Choice
            </h2>
            <div className="space-y-1">
              {forcedChoiceQuestions.map((q, idx) => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  traits={traits}
                  testSlug={slug}
                  isFirst={idx === 0}
                  isLast={idx === forcedChoiceQuestions.length - 1}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <AddQuestionForm
        traits={traits}
        testId={test.id}
        testSlug={slug}
        defaultKind={
          test.question_kind === "forced_choice" ? "forced_choice" : "likert"
        }
      />
    </div>
  );
}

function QuestionRow({
  question,
  traits,
  testSlug,
  isFirst,
  isLast,
}: {
  question: Question;
  traits: Trait[];
  testSlug: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <details className="group border border-border/50 hover:border-border transition-colors">
      <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer list-none">
        <span className="flex gap-1 shrink-0">
          <form action={moveQuestionAction}>
            <input type="hidden" name="id" value={question.id} />
            <input type="hidden" name="direction" value="up" />
            <input type="hidden" name="test_slug" value={testSlug} />
            <button
              type="submit"
              disabled={isFirst}
              className="px-1.5 py-0.5 text-xs text-muted hover:text-foreground transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              title="Move up"
            >
              ↑
            </button>
          </form>
          <form action={moveQuestionAction}>
            <input type="hidden" name="id" value={question.id} />
            <input type="hidden" name="direction" value="down" />
            <input type="hidden" name="test_slug" value={testSlug} />
            <button
              type="submit"
              disabled={isLast}
              className="px-1.5 py-0.5 text-xs text-muted hover:text-foreground transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              title="Move down"
            >
              ↓
            </button>
          </form>
        </span>
        <span className="flex-1 text-sm text-foreground/80">
          {question.text}
        </span>
        <span className="text-xs text-muted shrink-0">
          {question.kind === "forced_choice" ? "FC" : "L"}
        </span>
        <span className="text-xs text-muted shrink-0 group-open:rotate-180 transition-transform">
          ▾
        </span>
      </summary>

      <div className="px-4 pb-4 pt-2 border-t border-border/50">
        <EditQuestionForm
          question={question}
          traits={traits}
          testSlug={testSlug}
        />
      </div>
    </details>
  );
}

function EditQuestionForm({
  question,
  traits,
  testSlug,
}: {
  question: Question;
  traits: Trait[];
  testSlug: string;
}) {
  return (
    <div className="space-y-3">
      <form action={updateQuestionAction} className="space-y-3">
        <input type="hidden" name="id" value={question.id} />
        <input type="hidden" name="test_slug" value={testSlug} />
        <textarea
          name="text"
          defaultValue={question.text}
          rows={2}
          required
          className="w-full bg-transparent border border-border px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-foreground/60 transition-colors"
        />

        {question.kind === "likert" ? (
          <div className="flex gap-3 items-center">
            <select
              name="trait_id"
              defaultValue={question.trait_id}
              className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
            >
              {traits.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                name="reverse_keyed"
                value="true"
                defaultChecked={question.reverse_keyed}
              />
              Reverse keyed
            </label>
          </div>
        ) : (
          <div className="space-y-2">
            {question.options.map((opt, i) => {
              return (
                <div key={opt.id} className="flex gap-2 items-center">
                  <span className="text-xs text-muted w-16 shrink-0">
                    Option {i + 1}
                  </span>
                  <input name={`option_${i}_id`} type="hidden" value={opt.id} />
                  <input
                    name={`option_${i}_label`}
                    defaultValue={opt.label}
                    className="flex-1 bg-transparent border border-border px-2 py-1 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
                  />
                  <select
                    name={`option_${i}_trait_id`}
                    defaultValue={opt.trait_id ?? ""}
                    className="bg-background border border-border px-2 py-1 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
                  >
                    <option value="">— Trait —</option>
                    {traits.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="submit"
          className="px-4 py-2 text-xs bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          Save
        </button>
      </form>

      <DeleteButton id={question.id} action={deleteQuestionAction} />
    </div>
  );
}

function AddQuestionForm({
  traits,
  testId,
  testSlug,
  defaultKind,
}: {
  traits: Trait[];
  testId: string;
  testSlug: string;
  defaultKind: "likert" | "forced_choice";
}) {
  return (
    <div className="border-t border-border pt-8">
      <h2 className="text-xs text-muted tracking-widest uppercase mb-4">
        Add Question
      </h2>
      <form action={createQuestionAction} className="space-y-4 max-w-xl">
        <input type="hidden" name="test_id" value={testId} />
        <input type="hidden" name="test_slug" value={testSlug} />

        <div className="flex gap-3">
          <select
            name="kind"
            defaultValue={defaultKind}
            className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
          >
            <option value="likert">Likert</option>
            <option value="forced_choice">Forced Choice</option>
          </select>
        </div>

        <textarea
          name="text"
          placeholder="Question text…"
          rows={2}
          required
          className="w-full bg-transparent border border-border px-4 py-3 text-sm text-foreground placeholder-foreground/30 resize-none focus:outline-none focus:border-foreground/60 transition-colors"
        />

        {/* Likert fields */}
        <div className="space-y-2">
          <div className="flex gap-3 items-center">
            <select
              name="trait_id"
              className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
            >
              <option value="">— Trait (for likert) —</option>
              {traits.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" name="reverse_keyed" value="true" />
              Reverse keyed
            </label>
          </div>
        </div>

        {/* Forced choice fields */}
        <div className="space-y-2">
          <p className="text-xs text-muted">
            Forced choice options (leave empty for likert):
          </p>
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-xs text-muted w-16 shrink-0">
                Option {i + 1}
              </span>
              <input
                name={`option_${i}_label`}
                placeholder="Option text…"
                className="flex-1 bg-transparent border border-border px-2 py-1 text-sm placeholder-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors"
              />
              <select
                name={`option_${i}_trait_id`}
                className="bg-background border border-border px-2 py-1 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
              >
                <option value="">— Trait —</option>
                {traits.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="px-5 py-3 text-sm bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          Add
        </button>
      </form>
    </div>
  );
}
