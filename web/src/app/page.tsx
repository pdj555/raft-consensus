import { Architecture } from "@/components/Architecture";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { LiveCluster } from "@/components/LiveCluster";
import { LoadingGate } from "@/components/LoadingGate";
import { SkipLink } from "@/components/SkipLink";
import { StateMachine } from "@/components/StateMachine";

export default function Home() {
  return (
    <LoadingGate>
      <SkipLink />
      <Header />
      <main id="main">
        <Hero />
        <LiveCluster />
        <Architecture />
        <StateMachine />
      </main>
      <Footer />
    </LoadingGate>
  );
}
