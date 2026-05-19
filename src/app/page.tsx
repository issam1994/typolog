import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import ValuesSection from "@/components/sections/ValuesSection";
import QuoteSection from "@/components/sections/QuoteSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ValuesSection />
        <QuoteSection />
      </main>
      <Footer />
    </>
  );
}
