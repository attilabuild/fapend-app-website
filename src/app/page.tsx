import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Statistics from '@/components/Statistics';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import Discord from '@/components/Discord';
import BottomCTA from '@/components/BottomCTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <Navbar />
      <Hero />
      <Statistics />
      <Testimonials />
      <FAQ />
      <Discord />
      <BottomCTA />
      <Footer />
    </main>
  );
}  