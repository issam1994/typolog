import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getTest } from "@/lib/db/queries";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const test = await getTest(slug);
  return { title: test ? `${test.name} — Typolog` : "Test — Typolog" };
}

export default async function TestOverviewPage({ params }: Props) {
  const { slug } = await params;
  const test = await getTest(slug);
  if (!test || !test.is_published) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-24">
        <div className="max-w-xl text-center">
          <p className="text-xs text-muted tracking-widest uppercase mb-6">
            ~{test.estimated_minutes} minutes
          </p>
          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight mb-6">
            {test.name}
          </h1>
          <p className="text-lg text-muted leading-relaxed mb-10">
            {test.description}
          </p>
          <Link
            href={`/tests/${test.slug}/quiz`}
            className="inline-block px-8 py-4 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            Start Test
          </Link>
          <div className="mt-6">
            <Link
              href="/tests"
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              ← All Tests
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
