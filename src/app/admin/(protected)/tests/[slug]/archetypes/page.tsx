import { notFound } from "next/navigation";
import { getTest, getArchetypes } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/db/auth";
import { ArchetypeRow } from "./ArchetypeRow";
import { CreateArchetypeModal } from "./CreateArchetypeModal";

export const metadata = { title: "Archetypes — Typolog Admin" };

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function ArchetypesPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { slug } = await params;
  const { error } = await searchParams;
  const test = await getTest(slug);
  if (!test) notFound();

  const archetypes = await getArchetypes(test.id);

  return (
    <div className="px-8 py-8 max-w-3xl mx-auto">
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="text-xl font-semibold tracking-tight">Archetypes</h1>
        <CreateArchetypeModal testId={test.id} testSlug={slug} />
      </div>
      <p className="text-xs text-muted mb-8">
        {test.name} · {archetypes.length} archetypes
      </p>

      {error && (
        <p className="text-sm text-danger border border-danger/30 px-4 py-3 mb-6">
          {decodeURIComponent(error)}
        </p>
      )}

      <div className="space-y-3">
        {archetypes.map((a) => (
          <ArchetypeRow key={a.id} archetype={a} testSlug={slug} />
        ))}
        {archetypes.length === 0 && (
          <p className="text-sm text-muted py-4">
            No archetypes yet. This test will show raw scores only.
          </p>
        )}
      </div>
    </div>
  );
}
