import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Portfolio from "@/components/sections/Portfolio";
import Sessions from "@/components/sections/Sessions";
import Social from "@/components/sections/Social";
import Support from "@/components/sections/Support";
import Contact from "@/components/sections/Contact";
import FloatingActions from "@/components/ui/FloatingActions";

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-black overflow-hidden selection:bg-white selection:text-black">
      <Hero />
      <About />
      <Portfolio />
      <Sessions />
      <Social />
      <Support />
      <Contact />

      <FloatingActions />
    </main>
  );
}
