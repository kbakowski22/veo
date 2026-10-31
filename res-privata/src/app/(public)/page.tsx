import { About } from "@/components/landing/About";
import { Audience } from "@/components/landing/Audience";
import { CalculatorSection } from "@/components/landing/CalculatorSection";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { JoinSection } from "@/components/landing/JoinSection";
import { Marquee } from "@/components/landing/Marquee";
import { Membership } from "@/components/landing/Membership";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <About />
      <Audience />
      <CalculatorSection />
      <Membership />
      <HowItWorks />
      <JoinSection />
    </>
  );
}
