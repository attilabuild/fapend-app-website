import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Statistics from '@/components/Statistics';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import BottomCTA from '@/components/BottomCTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <Navbar />
      <Hero />
      <div className="w-full bg-secondary py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Trusted by Thousands Worldwide</h2>
          <div className="flex flex-wrap justify-center gap-8 opacity-70">
            {/* Partner logos would go here */}
            <div className="h-8 w-24 bg-gray-700 rounded"></div>
            <div className="h-8 w-24 bg-gray-700 rounded"></div>
            <div className="h-8 w-24 bg-gray-700 rounded"></div>
            <div className="h-8 w-24 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
      <Statistics />
      <Testimonials />
      <FAQ />
      <BottomCTA />
      <Footer />
    </main>
  );
} 