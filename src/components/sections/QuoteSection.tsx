export default function QuoteSection() {
  return (
    <section className="border-t border-border py-32 px-6 text-center">
      <blockquote className="max-w-2xl mx-auto">
        <p className="text-3xl sm:text-4xl font-light leading-snug tracking-tight text-foreground/90">
          &ldquo;Knowing yourself is the beginning of all wisdom.&rdquo;
        </p>
        <footer className="mt-6 text-sm text-muted tracking-widest uppercase">
          Aristotle
        </footer>
      </blockquote>
    </section>
  );
}
