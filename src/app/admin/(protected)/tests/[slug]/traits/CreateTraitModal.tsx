"use client";

import { useState } from "react";
import { Modal } from "@/components/admin/Modal";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createTraitAction } from "@/app/admin/(protected)/tests/[slug]/traits/actions";

export function CreateTraitModal({
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
        + Add Trait
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Trait">
        <form action={createTraitAction} className="space-y-3">
          <input type="hidden" name="test_id" value={testId} />
          <input type="hidden" name="test_slug" value={testSlug} />
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
              placeholder="Polarity slug (optional)"
              className="flex-1 bg-transparent border border-border px-3 py-2 text-sm placeholder-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors"
            />
            <SubmitButton
              pendingLabel="Adding…"
              className="px-5 py-2 text-sm bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-60"
            >
              Add
            </SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
