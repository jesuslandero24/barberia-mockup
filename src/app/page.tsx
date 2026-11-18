import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Services } from "@/components/Services";
import { Works } from "@/components/Works";
import { Barbers } from "@/components/Barbers";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Services />
        <Works />
        <Barbers />
      </main>
      <Footer />
    </>
  );
}
