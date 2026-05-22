"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  testSlug: string;
};

export default function ResultsFallback({ testSlug }: Props) {
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem(`typolog_submission:${testSlug}`);
    if (id) {
      router.replace(`/tests/${testSlug}/results?submission=${id}`);
    }
  }, [testSlug, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
      <p className="text-muted mb-6">No results found. Take the test first.</p>
      <Link
        href={`/tests/${testSlug}/quiz`}
        className="px-6 py-3 bg-foreground text-background text-sm hover:bg-foreground/90 transition-colors"
      >
        Take the Test
      </Link>
    </div>
  );
}
