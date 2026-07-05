"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/admin/Modal";

type ImportResult = {
  created: number;
  errors: { row: number; message: string }[];
};

export function ImportQuestionsModal({ testSlug }: { testSlug: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleOpen() {
    setOpen(true);
    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setLoading(true);
    setResult(null);
    const body = new FormData();
    body.set("file", file);
    try {
      const res = await fetch(`/admin/tests/${testSlug}/questions/import`, {
        method: "POST",
        body,
      });
      const data = (await res.json()) as ImportResult;
      setResult(data);
      if (data.created > 0) router.refresh();
    } catch {
      setResult({ created: 0, errors: [{ row: 0, message: "Network error" }] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-xs text-muted border border-border px-3 py-1.5 hover:border-foreground/60 hover:text-foreground transition-colors"
      >
        Import
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Import Questions"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-xs text-muted space-y-2">
            <p>
              Upload a <code className="bg-accent px-1">.csv</code> or{" "}
              <code className="bg-accent px-1">.json</code> file to bulk-add
              questions.
            </p>
            <div className="bg-accent/50 px-3 py-2.5 font-mono text-[11px] leading-relaxed">
              <p className="text-muted/70 mb-1"># CSV headers:</p>
              <p>
                kind, text, trait_slug, reverse_keyed,
                <br />
                option_0_label, option_0_trait_slug,
                <br />
                option_1_label, option_1_trait_slug
              </p>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".csv,.json"
            required
            className="w-full text-xs text-muted file:text-xs file:border file:border-border file:bg-transparent file:px-3 file:py-1.5 file:text-muted file:mr-3 file:cursor-pointer"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "Importing…" : "Import"}
            </button>
          </div>

          {result && (
            <div className="text-xs space-y-2 pt-1 border-t border-border">
              {result.created > 0 && (
                <p className="text-foreground/70">
                  {result.created} question{result.created !== 1 ? "s" : ""}{" "}
                  imported successfully.
                </p>
              )}
              {result.errors.length > 0 && (
                <div className="space-y-1">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-[color:var(--color-danger)]">
                      {err.row > 0 ? `Row ${err.row}: ` : ""}
                      {err.message}
                    </p>
                  ))}
                </div>
              )}
              {result.created === 0 && result.errors.length === 0 && (
                <p className="text-muted">No questions found in file.</p>
              )}
            </div>
          )}
        </form>
      </Modal>
    </>
  );
}
