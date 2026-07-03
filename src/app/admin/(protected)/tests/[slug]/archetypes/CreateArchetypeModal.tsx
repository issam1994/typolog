"use client";

import { useState } from "react";
import { Modal } from "@/components/admin/Modal";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createArchetypeAction } from "@/app/admin/(protected)/tests/[slug]/archetypes/actions";

export function CreateArchetypeModal({
  testId,
  testSlug,
}: {
  testId: string;
  testSlug: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-1.5 border border-border hover:border-foreground/60 transition-colors"
      >
        + Add Archetype
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Archetype">
        <form action={createArchetypeAction} className="space-y-3">
          <input type="hidden" name="test_id" value={testId} />
          <input type="hidden" name="test_slug" value={testSlug} />
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
          <SubmitButton
            pendingLabel="Adding…"
            className="px-5 py-2 text-sm bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-60"
          >
            Add
          </SubmitButton>
        </form>
      </Modal>
    </>
  );
}
