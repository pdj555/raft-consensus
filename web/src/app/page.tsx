import { Architecture } from "@/components/Architecture";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { LiveCluster } from "@/components/LiveCluster";
import { LoadingGate } from "@/components/LoadingGate";
import { StateMachine } from "@/components/StateMachine";

export default function Home() {
  return (
    <LoadingGate>
      <Header />
      <main>
        <Hero />
        <LiveCluster />
        <Architecture />
        <StateMachine />
      </main>
      <Footer />
    </LoadingGate>
  );
}
