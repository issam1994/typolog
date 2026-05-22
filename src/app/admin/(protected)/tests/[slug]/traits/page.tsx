import { notFound } from "next/navigation";
import { getTest, getAllTraits } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/db/auth";
import DeleteButton from "@/components/admin/DeleteButton";
import { createTrait, updateTrait, deleteTrait } from "./actions";
import type { Trait } from "@/types/shared/quiz";

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
      <h1 className="text-xl font-semibold tracking-tight mb-2">Traits</h1>
      <p className="text-xs text-muted mb-8">
        {test.name} · {traits.length} traits
      </p>

      {error && (
        <p className="text-sm text-danger border border-danger/30 px-4 py-3 mb-6">
          {decodeURIComponent(error)}
        </p>
      )}

      <div className="space-y-3 mb-12">
        {traits.map((trait) => (
          <TraitRow
            key={trait.id}
            trait={trait}
            _allTraits={traits}
            testSlug={slug}
          />
        ))}
        {traits.length === 0 && (
          <p className="text-sm text-muted py-4">No traits yet.</p>
        )}
      </div>

      <div className="border-t border-border pt-8">
        <h2 className="text-xs text-muted tracking-widest uppercase mb-4">
          Add Trait
        </h2>
        <form action={createTrait} className="space-y-3 max-w-xl">
          <input type="hidden" name="test_id" value={test.id} />
          <input type="hidden" name="test_slug" value={slug} />
          <div className="grid grid-cols-2 gap-3">
            <input
              name="slug"
              placeholder="slug (e.g. openness)"
              required
              pattern="[a-z0-9_-]+"
              className="bg-transparent border border-border px-3 py-2 text-sm placeholder-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors"
            />
            <input
              name="label"
              placeholder="Label (e.g. Openness)"
              required
              className="bg-transparent border border-border px-3 py-2 text-sm placeholder-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors"
            />
          </div>
          <textarea
            name="description"
            placeholder="Description…"
            rows={2}
            className="w-full bg-transparent border border-border px-3 py-2 text-sm placeholder-foreground/30 resize-none focus:outline-none focus:border-foreground/60 transition-colors"
          />
          <div className="flex gap-3 items-center">
            <input
              name="polarity"
              placeholder="Polarity slug (optional, for MBTI pairs)"
              className="flex-1 bg-transparent border border-border px-3 py-2 text-sm placeholder-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors"
            />
            <button
              type="submit"
              className="px-5 py-2 text-sm bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TraitRow({
  trait,
  _allTraits,
  testSlug,
}: {
  trait: Trait;
  _allTraits: Trait[];
  testSlug: string;
}) {
  return (
    <details className="group border border-border/50 hover:border-border transition-colors">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none">
        <div>
          <span className="text-sm font-medium">{trait.label}</span>
          <span className="text-xs text-muted ml-2">{trait.slug}</span>
          {trait.polarity && (
            <span className="text-xs text-muted ml-1">↔ {trait.polarity}</span>
          )}
        </div>
        <span className="text-xs text-muted group-open:rotate-180 transition-transform">
          ▾
        </span>
      </summary>

      <div className="px-4 pb-4 pt-2 border-t border-border/50">
        <form action={updateTrait} className="space-y-3">
          <input type="hidden" name="id" value={trait.id} />
          <input type="hidden" name="test_slug" value={testSlug} />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted tracking-widest uppercase">
                Label
              </label>
              <input
                name="label"
                defaultValue={trait.label}
                required
                className="bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted tracking-widest uppercase">
                Polarity slug
              </label>
              <input
                name="polarity"
                defaultValue={trait.polarity ?? ""}
                placeholder="e.g. i (for MBTI)"
                className="bg-transparent border border-border px-3 py-2 text-sm placeholder-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted tracking-widest uppercase">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={trait.description}
              rows={2}
              className="bg-transparent border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:border-foreground/60 transition-colors"
            />
          </div>

          <div className="flex gap-3 items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 text-xs bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              Save
            </button>
          </div>
        </form>

        <DeleteButton id={trait.id} action={deleteTrait} />
      </div>
    </details>
  );
}
