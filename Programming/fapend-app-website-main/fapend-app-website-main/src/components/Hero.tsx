"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import localFont from 'next/font/local';

const instrumentSerif = localFont({ 
  src: '../../fonts/InstrumentSerif-Italic.ttf',
  variable: '--font-instrument-serif'
});

const Hero = () => {
  const pillRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (pillRef.current) observer.observe(pillRef.current);
    if (titleRef.current) observer.observe(titleRef.current);
    if (descriptionRef.current) observer.observe(descriptionRef.current);
    if (buttonsRef.current) observer.observe(buttonsRef.current);
    if (imageRef.current) observer.observe(imageRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="hero" className="w-full bg-black min-h-screen flex items-center justify-center py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Text Content */}
          <div className="text-center mb-12 mt-24">
            <div 
              ref={pillRef}
              className="inline-block px-4 py-1.5 rounded-full border border-gray-800 bg-[#111111] text-white text-sm opacity-0 translate-y-8 transition-all duration-1000 ease-out"
            >
              The Ultimate NoFap App
            </div>
            <h1 
              ref={titleRef}
              className="text-4xl md:text-[70px] font-medium mb-4 text-white opacity-0 translate-y-8 transition-all duration-1000 ease-out leading-[1.1]"
            >
              Rewire your brain,
              <br className="leading-[0.2]" />
              <span className={`${instrumentSerif.className} font-normal`}>one day</span> <span className="font-medium">at a time.</span>
            </h1>
            <p 
              ref={descriptionRef}
              className="text-md md:text-md text-gray-400 mb-8 max-w-xl mx-auto opacity-0 translate-y-8 transition-all duration-1000 ease-out delay-300 px-8 sm:px-0 max-w-[280px] sm:max-w-2xl"
            >
              Backed by neuroscience and thousands of successful streaks.
            </p>
            
            <div 
              ref={buttonsRef}
              className="flex flex-col sm:flex-row justify-center gap-3 mb-12 opacity-0 translate-y-8 transition-all duration-1000 ease-out delay-500 px-12 sm:px-0"
            >
              <Link
                href="https://apps.apple.com/app/apple-store/id6745742828?pt=127826558&ct=website&mt=8" 
                className="group bg-[#0066FF]/10 hover:bg-[#0066FF]/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-lg font-medium transform hover:scale-105 transition-all duration-300 hover:shadow-lg flex items-center justify-center border border-[#0066FF]/20 hover:border-[#0066FF]/30 text-sm w-full sm:w-auto min-w-[180px]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                App Store
              </Link>
              <Link
                href="/waitlist"
                className="group bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white px-5 py-2.5 rounded-lg font-medium transform hover:scale-105 transition-all duration-300 hover:shadow-lg flex items-center justify-center border border-gray-800 hover:border-gray-700 text-sm w-full sm:w-auto min-w-[180px]"
              >
                <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 512 512">
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                </svg>
                Google Play Store
              </Link>
            </div>
          </div>
          
          {/* App Mockup */}
          <div 
            ref={imageRef}
            className="relative max-w-3xl mx-auto opacity-0 translate-y-8 transition-all duration-1000 ease-out delay-700"
          >
            <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-[#6C2BD9] opacity-20 blur-3xl -z-10"></div>
            <a href="https://apps.apple.com/app/apple-store/id6745742828?pt=127826558&ct=website&mt=8" target="_blank" rel="noopener noreferrer">
              <Image 
                src="/mockup.webp" 
                alt="PureResist App Mockup" 
                width={800} 
                height={1000}
                className="w-full h-auto rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-500"
                priority
              />
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        .animate-in.opacity-0 {
          opacity: 1 !important;
        }
      `}</style>
    </section>
  );
};

export default Hero; 