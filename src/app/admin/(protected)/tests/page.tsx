import Link from "next/link";
import { getAllTests } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/db/auth";
import { togglePublished } from "./actions";
import { CreateTestModal } from "./CreateTestModal";

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
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted">{tests.length} total</span>
          <CreateTestModal />
        </div>
      </div>

      {error && (
        <p className="text-sm text-danger border border-danger/30 px-4 py-3 mb-6">
          {decodeURIComponent(error)}
        </p>
      )}

      <div className="space-y-2">
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
              <form action={togglePublished} className="flex items-center">
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
    </div>
  );
}
