"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function TestsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-foreground/50 mb-2 text-sm">Something went wrong.</p>
      <p className="text-xs text-muted mb-8">{error.message}</p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-5 py-2 text-sm bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-5 py-2 text-sm border border-border text-muted hover:text-foreground transition-colors"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
