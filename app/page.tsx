import Footer from "@/components/footer";
import HeroSlider from "@/components/hero-slider";
import Navbar from "@/components/navbar";
import TrackingSection from "@/components/tracking-section";
import FloatingWhatsApp from "@/components/whatsapp-button";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F4F7FB] font-sans text-slate-900">
      <Navbar />
      <HeroSlider />
      <TrackingSection />
      <section className="mt-20">
        <Footer />
      </section>
      <FloatingWhatsApp />
    </div>
  );
}
