"use client";

import { useState } from "react";
import { Modal } from "@/components/admin/Modal";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createTestAction } from "./actions";

export function CreateTestModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-1.5 border border-border hover:border-foreground/60 transition-colors"
      >
        + New Test
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Create Test">
        <form action={createTestAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              name="name"
              placeholder="Name (e.g. Big Five)"
              required
              className="bg-transparent border border-border px-3 py-2 text-sm placeholder-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors"
            />
            <input
              name="slug"
              placeholder="slug (e.g. big-five)"
              required
              pattern="[a-z0-9-]+"
              className="bg-transparent border border-border px-3 py-2 text-sm placeholder-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors"
            />
          </div>
          <input
            name="tagline"
            placeholder="Short tagline…"
            className="w-full bg-transparent border border-border px-3 py-2 text-sm placeholder-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors"
          />
          <textarea
            name="description"
            placeholder="Description…"
            rows={2}
            className="w-full bg-transparent border border-border px-3 py-2 text-sm placeholder-foreground/30 resize-none focus:outline-none focus:border-foreground/60 transition-colors"
          />
          <div className="grid grid-cols-3 gap-3">
            <select
              name="question_kind"
              required
              className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
            >
              <option value="likert">Likert</option>
              <option value="forced_choice">Forced Choice</option>
              <option value="mixed">Mixed</option>
            </select>
            <select
              name="scoring_strategy"
              required
              className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
            >
              <option value="likert_percentage">Likert %</option>
              <option value="mbti_dichotomy">MBTI Dichotomy</option>
              <option value="enneagram_dominant">Enneagram Dominant</option>
              <option value="cognitive_stack">Cognitive Stack</option>
              <option value="psychosophy_stack">Psychosophy Stack</option>
            </select>
            <select
              name="result_template"
              required
              className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
            >
              <option value="bars">Bars</option>
              <option value="mbti_code">MBTI Code</option>
              <option value="enneagram_type">Enneagram Type</option>
              <option value="cognitive_stack">Cognitive Stack</option>
              <option value="psychosophy_stack">Psychosophy Stack</option>
            </select>
          </div>
          <div className="flex gap-3 items-center">
            <input
              name="estimated_minutes"
              type="number"
              min="1"
              max="60"
              defaultValue="5"
              placeholder="Minutes"
              className="w-24 bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/60 transition-colors"
            />
            <SubmitButton
              pendingLabel="Creating…"
              className="px-5 py-2 text-sm bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-60"
            >
              Create
            </SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
