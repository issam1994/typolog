import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-foreground/50 text-sm mb-6">Submission not found.</p>
      <Link
        href="/admin/tests"
        className="text-xs text-muted hover:text-foreground transition-colors"
      >
        ← Back to Tests
      </Link>
    </div>
  );
}
