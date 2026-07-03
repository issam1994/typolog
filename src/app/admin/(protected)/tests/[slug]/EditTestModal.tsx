"use client";

import { useState } from "react";
import { Modal } from "@/components/admin/Modal";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { updateTestAction } from "@/app/admin/(protected)/tests/actions";
import type { Test } from "@/types/quiz";

export function EditTestModal({ test }: { test: Test }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-muted hover:text-foreground transition-colors"
      >
        Edit
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Edit Test">
        <form action={updateTestAction} className="space-y-3">
          <input type="hidden" name="id" value={test.id} />
          <input
            name="name"
            defaultValue={test.name}
            required
            className="w-full bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
          />
          <input
            name="tagline"
            defaultValue={test.tagline}
            className="w-full bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
          />
          <textarea
            name="description"
            defaultValue={test.description}
            rows={3}
            className="w-full bg-transparent border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:border-foreground/60 transition-colors"
          />
          <div className="flex gap-3 items-center">
            <input
              name="estimated_minutes"
              type="number"
              min="1"
              max="60"
              defaultValue={test.estimated_minutes}
              className="w-24 bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
            />
            <SubmitButton
              pendingLabel="Saving…"
              className="px-4 py-2 text-sm bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-60"
            >
              Save
            </SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
