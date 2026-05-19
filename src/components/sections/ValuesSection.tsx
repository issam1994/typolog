const values = [
  {
    title: "Self-Awareness",
    body: "Understand your strengths, blind spots, and what drives your decisions — so you can act with more intention.",
  },
  {
    title: "Better Relationships",
    body: "Knowing your personality helps you communicate more effectively and understand why others think differently.",
  },
  {
    title: "Personal Growth",
    body: "Build on the traits that come naturally to you and develop a clear path toward the person you want to become.",
  },
];

export default function ValuesSection() {
  return (
    <section className="border-t border-white/10 py-24 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-12">
        {values.map((value) => (
          <div key={value.title}>
            <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              {value.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
