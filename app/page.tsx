import Footer from "@/components/footer";
import HeroSlider from "@/components/hero-slider";
import HomePersyaratan from "@/components/home-persyaratan";
import Navbar from "@/components/navbar";
import TrackingSection from "@/components/tracking-section";
import FloatingWhatsApp from "@/components/whatsapp-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F4F7FB] font-sans text-slate-900">
      <Navbar />
      <HeroSlider />
      <HomePersyaratan />
      <TrackingSection />
      <section>
        <Footer />
      </section>
      <FloatingWhatsApp />
    </div>
  );
}
