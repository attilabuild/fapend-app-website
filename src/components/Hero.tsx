"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Hero = () => {
  return (
    <section id="hero" className="w-full bg-black py-16">
      <div className="container mx-auto px-4 pt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2 max-w-6xl mx-auto">
          {/* Left side - Text Content */}
          <div className="order-1 text-center md:text-left pr-0 md:pr-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 gradient-text">
              Your All-in-One<br />NoFap Companion
            </h1>
            <p className="text-lg md:text-xl text-text-secondary mb-6 max-w-2xl mx-auto md:mx-0">
              Track your progress, get daily motivation, set goals, and join a supportive community on your journey to self-improvement.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 mb-6">
              <Link
                href="/waitlist" 
                className="btn-primary"
              >
                <svg className="w-6 h-6 mr-2 inline-block" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                App Store
              </Link> 
              <Link
                href="/waitlist"
                className="btn-secondary"
              >
                <svg className="w-6 h-6 mr-2 inline-block" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 20.5v-17c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v17l-7-3-7 3zm7-15c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
                Google Play
              </Link>
            </div>
          </div>
          
          {/* Right side - App Mockup */}
          <div className="order-2 flex justify-center md:justify-start relative pl-0 md:pl-4">
            <div className="relative">
              <div className="absolute top-0 left-0 w-60 h-60 bg-gradient-purple-mid rounded-full filter blur-[100px] opacity-20 -z-10"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-blue-start rounded-full filter blur-[80px] opacity-20 -z-10"></div>
              
              <Image 
                src="/mockup.png" 
                alt="Fapend App Mockup" 
                width={500} 
                height={1000}
                className="max-w-full h-auto rounded-3xl shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-20 left-0 w-96 h-96 bg-gradient-blue-start rounded-full filter blur-[150px] opacity-5"></div>
        <div className="absolute bottom-20 right-0 w-96 h-96 bg-gradient-purple-start rounded-full filter blur-[150px] opacity-5"></div>
      </div>
    </section>
  );
};

export default Hero; 