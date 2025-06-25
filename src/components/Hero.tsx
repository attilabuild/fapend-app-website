"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Hero = () => {
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

    if (titleRef.current) observer.observe(titleRef.current);
    if (descriptionRef.current) observer.observe(descriptionRef.current);
    if (buttonsRef.current) observer.observe(buttonsRef.current);
    if (imageRef.current) observer.observe(imageRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="hero" className="w-full bg-black py-16 overflow-hidden">
      <div className="container mx-auto px-4 pt-24">
        <div className="grid grid-cols-1 mt-20 md:grid-cols-2 items-center gap-2 max-w-6xl mx-auto mb-16">
          {/* Left side - Text Content */}
          <div className="order-1 mt-12 text-center md:text-left pr-0 md:pr-4">
            <h1 
              ref={titleRef}
              className="text-4xl md:text-4xl lg:text-4xl font-bold mb-4 gradient-text opacity-0 translate-y-8 transition-all duration-1000 ease-out"
            >
Quit porn with a proven neuroscience-backed app.
</h1>
            <p 
              ref={descriptionRef}
              className="text-lg md:text-xl text-text-secondary mb-6 max-w-2xl mx-auto md:mx-0 opacity-0 translate-y-8 transition-all duration-1000 ease-out delay-300"
            >
              Track your journey, find daily motivation, and build lasting habits with our unique, community-driven approach. 
            </p>
            
            <div 
              ref={buttonsRef}
              className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 mb-6 opacity-0 translate-y-8 transition-all duration-1000 ease-out delay-500"
            >
              <Link
                href="https://apps.apple.com/rs/app/pureresist-quit-corn-now/id6745742828" 
                className="btn-primary transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-6 h-6 mr-2 inline-block" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                App Store
              </Link> 
              <Link
                href="/waitlist"
                className="btn-secondary transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
              >
                <svg className="w-6 h-6 mr-2 inline-block" fill="currentColor" viewBox="0 0 512 512">
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                </svg>
                Google Play
              </Link>
            </div>
          </div>
          
          {/* Right side - App Mockup */}
          <div 
            ref={imageRef}
            className="order-2 flex justify-center md:justify-start relative pl-0 md:pl-4 opacity-0 translate-x-8 transition-all duration-1000 ease-out delay-700"
          >
            <div className="relative">
              <div className="absolute top-0 left-0 w-60 h-60 bg-gradient-purple-mid rounded-full filter blur-[100px] opacity-20 -z-10 animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-blue-start rounded-full filter blur-[80px] opacity-20 -z-10 animate-pulse delay-1000"></div>
              
              <Image 
                src="/pureresist.png" 
                alt="PureResist App Mockup" 
                width={800} 
                height={1000}
                className="max-w-full h-auto rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500 hover:shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-20 left-0 w-96 h-96 bg-gradient-blue-start rounded-full filter blur-[150px] opacity-5 animate-pulse"></div>
        <div className="absolute bottom-20 right-0 w-96 h-96 bg-gradient-purple-start rounded-full filter blur-[150px] opacity-5 animate-pulse delay-2000"></div>
      </div>

      <style jsx>{`
        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        .animate-in.opacity-0 {
          opacity: 1 !important;
        }
        .animate-in.translate-x-8 {
          transform: translateX(0) !important;
        }
      `}</style>
    </section>
  );
};

export default Hero; 