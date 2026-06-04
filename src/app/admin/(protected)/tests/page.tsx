import Link from "next/link";
import { getAllTests } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/db/auth";
import { createTest, togglePublished } from "./actions";

export const metadata = { title: "Tests — Typolog Admin" };

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function TestsPage({ searchParams }: Props) {
  await requireAdmin();
  const { error } = await searchParams;
  const tests = await getAllTests();

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Tests</h1>
        <span className="text-xs text-muted">{tests.length} total</span>
      </div>

      {error && (
        <p className="text-sm text-danger border border-danger/30 px-4 py-3 mb-6">
          {decodeURIComponent(error)}
        </p>
      )}

      <div className="space-y-2 mb-12">
        {tests.map((test) => (
          <div
            key={test.id}
            className="border border-border/50 flex items-center gap-4 px-4 py-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">{test.name}</span>
                <span className="text-xs text-muted">{test.slug}</span>
                {!test.is_published && (
                  <span className="text-xs text-muted border border-border px-1.5 py-0.5">
                    draft
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-0.5 truncate">
                {test.tagline}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <form action={togglePublished}>
                <input type="hidden" name="id" value={test.id} />
                <input
                  type="hidden"
                  name="is_published"
                  value={String(!test.is_published)}
                />
                <button
                  type="submit"
                  className="text-xs text-muted hover:text-foreground transition-colors"
                >
                  {test.is_published ? "Unpublish" : "Publish"}
                </button>
              </form>
              <Link
                href={`/admin/tests/${test.slug}`}
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                Manage →
              </Link>
            </div>
          </div>
        ))}
        {tests.length === 0 && (
          <p className="text-sm text-muted py-4">No tests yet.</p>
        )}
      </div>

      <div className="border-t border-border pt-8">
        <h2 className="text-xs text-muted tracking-widest uppercase mb-4">
          Create Test
        </h2>
        <form action={createTest} className="space-y-4 max-w-xl">
          <div className="grid grid-cols-2 gap-3">
            <input
              name="name"
              placeholder="Name (e.g. Big Five)"
              required
              className="bg-transparent border border-border px-3 py-2 text-sm placeholder-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors"
            />
            <input
              name="slug"
              placeholder="slug (e.g. big-five)"
              required
              pattern="[a-z0-9-]+"
              className="bg-transparent border border-border px-3 py-2 text-sm placeholder-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors"
            />
          </div>
          <input
            name="tagline"
            placeholder="Short tagline…"
            className="w-full bg-transparent border border-border px-3 py-2 text-sm placeholder-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors"
          />
          <textarea
            name="description"
            placeholder="Description…"
            rows={2}
            className="w-full bg-transparent border border-border px-3 py-2 text-sm placeholder-foreground/30 resize-none focus:outline-none focus:border-foreground/60 transition-colors"
          />
          <div className="grid grid-cols-3 gap-3">
            <select
              name="question_kind"
              required
              className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
            >
              <option value="likert">Likert</option>
              <option value="forced_choice">Forced Choice</option>
              <option value="mixed">Mixed</option>
            </select>
            <select
              name="scoring_strategy"
              required
              className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
            >
              <option value="likert_percentage">Likert %</option>
              <option value="mbti_dichotomy">MBTI Dichotomy</option>
              <option value="enneagram_dominant">Enneagram Dominant</option>
              <option value="cognitive_stack">Cognitive Stack</option>
              <option value="psychosophy_stack">Psychosophy Stack</option>
            </select>
            <select
              name="result_template"
              required
              className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
            >
              <option value="bars">Bars</option>
              <option value="mbti_code">MBTI Code</option>
              <option value="enneagram_type">Enneagram Type</option>
              <option value="cognitive_stack">Cognitive Stack</option>
              <option value="psychosophy_stack">Psychosophy Stack</option>
            </select>
          </div>
          <div className="flex gap-3">
            <input
              name="estimated_minutes"
              type="number"
              min="1"
              max="60"
              defaultValue="5"
              placeholder="Minutes"
              className="w-24 bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
            />
            <button
              type="submit"
              className="px-5 py-2 text-sm bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
