"use client";

import { useState } from "react";
import { Modal } from "@/components/admin/Modal";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createQuestionAction } from "@/app/admin/(protected)/tests/[slug]/questions/actions";
import type { Trait } from "@/types/quiz";

export function CreateQuestionModal({
  testId,
  testSlug,
  traits,
  defaultKind,
}: {
  testId: string;
  testSlug: string;
  traits: Trait[];
  defaultKind: "likert" | "forced_choice";
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"likert" | "forced_choice">(defaultKind);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-1.5 border border-border hover:border-foreground/60 transition-colors"
      >
        + Add Question
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Question">
        <form action={createQuestionAction} className="space-y-4">
          <input type="hidden" name="test_id" value={testId} />
          <input type="hidden" name="test_slug" value={testSlug} />

          <select
            name="kind"
            value={kind}
            onChange={(e) =>
              setKind(e.target.value as "likert" | "forced_choice")
            }
            className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
          >
            <option value="likert">Likert</option>
            <option value="forced_choice">Forced Choice</option>
          </select>

          <textarea
            name="text"
            placeholder="Question text…"
            rows={2}
            required
            className="w-full bg-transparent border border-border px-4 py-3 text-sm text-foreground placeholder-foreground/30 resize-none focus:outline-none focus:border-foreground/60 transition-colors"
          />

          {kind === "likert" ? (
            <div className="flex gap-3 items-center">
              <select
                name="trait_id"
                className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
              >
                <option value="">— Trait —</option>
                {traits.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-xs text-muted">
                <input type="checkbox" name="reverse_keyed" value="true" />
                Reverse keyed
              </label>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted">Options:</p>
              {[0, 1].map((i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-xs text-muted w-16 shrink-0">
                    Option {i + 1}
                  </span>
                  <input
                    name={`option_${i}_label`}
                    placeholder="Option text…"
                    className="flex-1 bg-transparent border border-border px-2 py-1 text-sm placeholder-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors"
                  />
                  <select
                    name={`option_${i}_trait_id`}
                    className="bg-background border border-border px-2 py-1 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
                  >
                    <option value="">— Trait —</option>
                    {traits.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <SubmitButton
            pendingLabel="Adding…"
            className="px-5 py-3 text-sm bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-60"
          >
            Add
          </SubmitButton>
        </form>
      </Modal>
    </>
  );
}
