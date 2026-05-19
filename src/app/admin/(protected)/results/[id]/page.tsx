import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubmission, getAllQuestions, getAllTraits } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/db/auth";

export const metadata = { title: "Submission — Typolog Admin" };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SubmissionPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const [submission, questions, traits] = await Promise.all([
    getSubmission(id),
    getAllQuestions(),
    getAllTraits(),
  ]);

  if (!submission) notFound();

  const answers = submission.answers as Record<string, number>;
  const scores = submission.scores as Record<string, number>;

  const likertLabels: Record<number, string> = {
    1: "Strongly Disagree",
    2: "Disagree",
    3: "Neutral",
    4: "Agree",
    5: "Strongly Agree",
  };

  const byTrait = traits.map((trait) => ({
    trait,
    questions: questions
      .filter((q) => q.trait_id === trait.id)
      .map((q) => ({ ...q, answer: answers[q.id] })),
  }));

  return (
    <div className="px-8 py-8 max-w-3xl">
      <Link
        href="/admin/results"
        className="text-xs text-muted hover:text-white transition-colors block mb-6"
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
        </p>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-10">
        {traits.map((t) => (
          <div key={t.id} className="border border-border px-3 py-3">
            <p className="text-xs text-muted mb-1">{t.label}</p>
            <p className="text-lg font-semibold">{scores[t.id] ?? 0}%</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted mb-1">
        Scores reflect values at submission time.
      </p>

      <div className="space-y-8 mt-6">
        {byTrait.map(({ trait, questions: tqs }) => (
          <section key={trait.id}>
            <h2 className="text-xs text-muted tracking-widest uppercase mb-3 pb-2 border-b border-border">
              {trait.label}
            </h2>
            <div className="space-y-2">
              {tqs.map((q) => (
                <div key={q.id} className="flex gap-4 items-start py-2">
                  <span className="text-xs text-muted shrink-0 w-36 text-right">
                    {q.answer !== undefined ? likertLabels[q.answer] : "—"}
                  </span>
                  <span className="text-sm text-white/70">{q.text}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
