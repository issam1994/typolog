import { notFound } from "next/navigation";
import { getTest, getAllTraits } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/db/auth";
import { TraitRow } from "./TraitRow";
import { CreateTraitModal } from "./CreateTraitModal";

export const metadata = { title: "Traits — Typolog Admin" };

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function TraitsPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { slug } = await params;
  const { error } = await searchParams;
  const test = await getTest(slug);
  if (!test) notFound();

  const traits = await getAllTraits(test.id);

  return (
    <div className="px-8 py-8 max-w-2xl mx-auto">
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="text-xl font-semibold tracking-tight">Traits</h1>
        <CreateTraitModal testId={test.id} testSlug={slug} />
      </div>
      <p className="text-xs text-muted mb-8">
        {test.name} · {traits.length} traits
      </p>

      {error && (
        <p className="text-sm text-danger border border-danger/30 px-4 py-3 mb-6">
          {decodeURIComponent(error)}
        </p>
      )}

      <div className="space-y-3">
        {traits.map((trait) => (
          <TraitRow key={trait.id} trait={trait} testSlug={slug} />
        ))}
        {traits.length === 0 && (
          <p className="text-sm text-muted py-4">No traits yet.</p>
        )}
      </div>
    </div>
  );
}
