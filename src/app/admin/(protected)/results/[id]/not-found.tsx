import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-white/50 text-sm mb-6">Submission not found.</p>
      <Link
        href="/admin/results"
        className="text-xs text-muted hover:text-white transition-colors"
      >
        ← Back to Results
      </Link>
    </div>
  );
}
