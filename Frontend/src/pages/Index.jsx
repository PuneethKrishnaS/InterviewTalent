import Header from "../components/pages/index/Header";
import Hero from "../components/pages/index/Hero";
import Features from "../components/pages/index/Features";
import HowItWorks from "../components/pages/index/HowItWorks";

export default function Index() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
    </div>
  );
}
