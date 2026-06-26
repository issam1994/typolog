import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getPublishedTests } from "@/lib/db/queries";

export const metadata = {
  title: "Personality Tests — Typolog",
};

export default async function TestsPage() {
  const tests = await getPublishedTests();

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="animate-fade-in-up text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
            Choose a Test
          </h1>
          <p className="animate-fade-in-up [animation-delay:80ms] text-muted mb-16">
            Each test explores a different dimension of your personality.
          </p>

          <div className="space-y-4">
            {tests.map((test, i) => (
              <Link
                key={test.id}
                href={`/tests/${test.slug}`}
                style={{ animationDelay: `${160 + i * 80}ms` }}
                className="animate-fade-in-up block border border-border p-6 hover:border-foreground/60 transition-colors group"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <h2 className="text-lg font-semibold tracking-tight group-hover:text-foreground transition-colors">
                    {test.name}
                  </h2>
                  <span className="text-xs text-muted">
                    ~{test.estimated_minutes} min
                  </span>
                </div>
                <p className="text-sm text-muted">{test.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
