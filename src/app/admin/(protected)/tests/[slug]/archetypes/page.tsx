import { notFound } from "next/navigation";
import { getTest, getArchetypes } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/db/auth";
import DeleteButton from "@/components/admin/DeleteButton";
import {
  createArchetypeAction,
  deleteArchetypeAction,
  updateArchetypeAction,
} from "./actions";
import type { Archetype } from "@/types/quiz";

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
      <h1 className="text-xl font-semibold tracking-tight mb-2">Archetypes</h1>
      <p className="text-xs text-muted mb-8">
        {test.name} · {archetypes.length} archetypes
      </p>

      {error && (
        <p className="text-sm text-danger border border-danger/30 px-4 py-3 mb-6">
          {decodeURIComponent(error)}
        </p>
      )}

      <div className="space-y-3 mb-12">
        {archetypes.map((a) => (
          <ArchetypeRow key={a.id} archetype={a} testSlug={slug} />
        ))}
        {archetypes.length === 0 && (
          <p className="text-sm text-muted py-4">
            No archetypes yet. This test will show raw scores only.
          </p>
        )}
      </div>

      <div className="border-t border-border pt-8">
        <h2 className="text-xs text-muted tracking-widest uppercase mb-4">
          Add Archetype
        </h2>
        <form action={createArchetypeAction} className="space-y-3 max-w-xl">
          <input type="hidden" name="test_id" value={test.id} />
          <input type="hidden" name="test_slug" value={slug} />
          <div className="grid grid-cols-2 gap-3">
            <input
              name="code"
              placeholder="Code (e.g. INTJ)"
              required
              className="bg-transparent border border-border px-3 py-2 text-sm placeholder-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors"
            />
            <input
              name="label"
              placeholder="Label (e.g. The Architect)"
              required
              className="bg-transparent border border-border px-3 py-2 text-sm placeholder-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors"
            />
          </div>
          <textarea
            name="description"
            placeholder="Short description (shown on results page)…"
            rows={2}
            className="w-full bg-transparent border border-border px-3 py-2 text-sm placeholder-foreground/30 resize-none focus:outline-none focus:border-foreground/60 transition-colors"
          />
          <textarea
            name="long_form"
            placeholder="Extended description (optional)…"
            rows={3}
            className="w-full bg-transparent border border-border px-3 py-2 text-sm placeholder-foreground/30 resize-none focus:outline-none focus:border-foreground/60 transition-colors"
          />
          <button
            type="submit"
            className="px-5 py-2 text-sm bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}

function ArchetypeRow({
  archetype,
  testSlug,
}: {
  archetype: Archetype;
  testSlug: string;
}) {
  return (
    <details className="group border border-border/50 hover:border-border transition-colors">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none">
        <div>
          <span className="text-sm font-medium">{archetype.code}</span>
          <span className="text-xs text-muted ml-2">{archetype.label}</span>
        </div>
        <span className="text-xs text-muted group-open:rotate-180 transition-transform">
          ▾
        </span>
      </summary>

      <div className="px-4 pb-4 pt-2 border-t border-border/50">
        <form action={updateArchetypeAction} className="space-y-3">
          <input type="hidden" name="id" value={archetype.id} />
          <input type="hidden" name="test_slug" value={testSlug} />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted tracking-widest uppercase">
                Code
              </label>
              <input
                name="code"
                defaultValue={archetype.code}
                required
                className="bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted tracking-widest uppercase">
                Label
              </label>
              <input
                name="label"
                defaultValue={archetype.label}
                required
                className="bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted tracking-widest uppercase">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={archetype.description}
              rows={2}
              className="bg-transparent border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:border-foreground/60 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted tracking-widest uppercase">
              Extended
            </label>
            <textarea
              name="long_form"
              defaultValue={archetype.long_form}
              rows={3}
              className="bg-transparent border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:border-foreground/60 transition-colors"
            />
          </div>
          <div className="flex gap-3 items-center">
            <button
              type="submit"
              className="px-4 py-2 text-xs bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
        <DeleteButton id={archetype.id} action={deleteArchetypeAction} />
      </div>
    </details>
  );
}
