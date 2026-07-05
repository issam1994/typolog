import { notFound } from "next/navigation";
import { getTest, getAllQuestions, getAllTraits } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/db/auth";
import { QuestionRow } from "./QuestionRow";
import { CreateQuestionModal } from "./CreateQuestionModal";
import { ImportQuestionsModal } from "./ImportQuestionsModal";

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
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted">{questions.length} active</span>
          <ImportQuestionsModal testSlug={slug} />
          <CreateQuestionModal
            testId={test.id}
            testSlug={slug}
            traits={traits}
            defaultKind={
              test.question_kind === "forced_choice"
                ? "forced_choice"
                : "likert"
            }
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-danger border border-danger/30 px-4 py-3 mb-6">
          {decodeURIComponent(error)}
        </p>
      )}

      <div className="space-y-10">
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
    </div>
  );
}
