"use client";

import { useTransition } from "react";
import {
  updateArchetypeAction,
  deleteArchetypeAction,
} from "@/app/admin/(protected)/tests/[slug]/archetypes/actions";
import type { Archetype } from "@/types/quiz";

export function ArchetypeRow({
  archetype,
  testSlug,
}: {
  archetype: Archetype;
  testSlug: string;
}) {
  const [savePending, startSave] = useTransition();
  const [deletePending, startDelete] = useTransition();

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startSave(async () => {
      await updateArchetypeAction(fd);
    });
  }

  function handleDelete() {
    if (!confirm("Delete this archetype?")) return;
    const fd = new FormData();
    fd.append("id", archetype.id);
    startDelete(async () => {
      await deleteArchetypeAction(fd);
    });
  }

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
        <form onSubmit={handleSave} className="space-y-3">
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

          <div className="flex gap-3 items-center justify-end">
            <button
              type="button"
              onClick={handleDelete}
              disabled={savePending || deletePending}
              className="text-xs text-danger hover:text-danger/80 transition-colors disabled:opacity-60"
            >
              {deletePending ? "Deleting…" : "Delete"}
            </button>
            <button
              type="submit"
              disabled={savePending || deletePending}
              className="px-4 py-2 text-xs bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-60"
            >
              {savePending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </details>
  );
}
