import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSubmission,
  getAllQuestions,
  getAllTraits,
  getTest,
} from "@/lib/db/queries";
import { requireAdmin } from "@/lib/db/auth";
import { likertOptions } from "@/constants/likert";

type Props = {
  params: Promise<{ slug: string; id: string }>;
};

export const metadata = { title: "Submission — Typolog Admin" };

export default async function SubmissionPage({ params }: Props) {
  await requireAdmin();
  const { slug, id } = await params;

  const test = await getTest(slug);
  if (!test) notFound();

  const [submission, questions, traits] = await Promise.all([
    getSubmission(id),
    getAllQuestions(test.id),
    getAllTraits(test.id),
  ]);

  if (!submission || submission.test_id !== test.id) notFound();

  const answers = submission.answers as Record<string, number>;
  const scores = submission.scores as Record<string, number>;

  const likertLabels = Object.fromEntries(
    likertOptions.map((o) => [o.value, o.label]),
  );

  const byTrait = traits.map((trait) => ({
    trait,
    questions: questions
      .filter((q) => q.kind === "likert" && q.trait_id === trait.id)
      .map((q) => ({ ...q, answer: answers[q.id] })),
  }));

  const forcedChoiceItems = questions
    .filter((q) => q.kind === "forced_choice")
    .map((q) => {
      const chosenValue = answers[q.id];
      const chosenOption =
        chosenValue !== undefined
          ? q.options.find((o) => o.value === chosenValue)
          : null;
      return { ...q, chosenLabel: chosenOption?.label ?? "—" };
    });

  return (
    <div className="px-8 py-8 max-w-3xl mx-auto">
      <Link
        href={`/admin/tests/${slug}/results`}
        className="text-xs text-muted hover:text-foreground transition-colors block mb-6"
      >
        ← Results
      </Link>

      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight mb-1">
          Submission
        </h1>
        <p className="text-xs text-muted">
          {new Date(submission.submitted_at).toLocaleString("en-US", {
            dateStyle: "long",
            timeStyle: "short",
          })}
          {submission.archetype_code && (
            <span className="ml-3 font-medium">
              {submission.archetype_code}
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-10">
        {traits.map((t) => (
          <div
            key={t.id}
            className="border border-border px-3 py-3 min-w-[100px]"
          >
            <p className="text-xs text-muted mb-1">{t.label}</p>
            <p className="text-lg font-semibold">{scores[t.slug] ?? 0}%</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted mb-4">
        Scores reflect values at submission time.
      </p>

      {byTrait.some((g) => g.questions.length > 0) && (
        <div className="space-y-8 mt-6">
          {byTrait.map(({ trait, questions: tqs }) =>
            tqs.length === 0 ? null : (
              <section key={trait.id}>
                <h2 className="text-xs text-muted tracking-widest uppercase mb-3 pb-2 border-b border-border">
                  {trait.label}
                </h2>
                <div className="space-y-2">
                  {tqs.map((q) => (
                    <div key={q.id} className="flex gap-4 items-start py-2">
                      <span className="text-xs text-muted shrink-0 w-36 text-right">
                        {q.answer !== undefined
                          ? (likertLabels[q.answer] ?? q.answer)
                          : "—"}
                      </span>
                      <span className="text-sm text-foreground/70">
                        {q.text}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ),
          )}
        </div>
      )}

      {forcedChoiceItems.length > 0 && (
        <div className="space-y-2 mt-8">
          <h2 className="text-xs text-muted tracking-widest uppercase mb-3 pb-2 border-b border-border">
            Forced Choice Responses
          </h2>
          {forcedChoiceItems.map((q) => (
            <div key={q.id} className="flex gap-4 items-start py-2">
              <span className="text-xs text-muted shrink-0 w-36 text-right truncate">
                {q.chosenLabel}
              </span>
              <span className="text-sm text-foreground/70">{q.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
