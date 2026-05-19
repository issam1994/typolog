import { getAllTraits } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/db/auth";
import { updateTrait } from "./actions";

export const metadata = { title: "Traits — Typolog Admin" };

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function TraitsPage({ searchParams }: Props) {
  await requireAdmin();
  const { error } = await searchParams;
  const traits = await getAllTraits();

  return (
    <div className="px-8 py-8 max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight mb-2">Traits</h1>
      <p className="text-xs text-muted mb-8">
        Edit labels and descriptions shown on the results page.
      </p>

      {error && (
        <p className="text-sm text-danger border border-danger/30 px-4 py-3 mb-6">
          {decodeURIComponent(error)}
        </p>
      )}

      <div className="space-y-6">
        {traits.map((trait) => (
          <details
            key={trait.id}
            className="group border border-border/50 hover:border-border transition-colors"
          >
            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none">
              <span className="text-sm font-medium">{trait.label}</span>
              <span className="text-xs text-muted group-open:rotate-180 transition-transform">
                ▾
              </span>
            </summary>

            <div className="px-4 pb-4 pt-2 border-t border-border/50">
              <form action={updateTrait} className="space-y-3">
                <input type="hidden" name="id" value={trait.id} />

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted tracking-widest uppercase">
                    Label
                  </label>
                  <input
                    name="label"
                    defaultValue={trait.label}
                    required
                    className="bg-transparent border border-border px-3 py-2 text-sm text-white focus:outline-none focus:border-white/60 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted tracking-widest uppercase">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={trait.description}
                    rows={2}
                    required
                    className="bg-transparent border border-border px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-white/60 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-white text-black hover:bg-white/90 transition-colors"
                >
                  Save
                </button>
              </form>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
