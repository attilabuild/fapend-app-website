"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const BottomCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="w-full bg-black py-20 overflow-hidden" id="download">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h2 
            className={`text-3xl md:text-4xl font-bold mb-6 transition-all duration-1000 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Your Freedom Is One Decision Away
          </h2>
          <p 
            className={`text-lg text-gray-300 mb-10 max-w-2xl mx-auto transition-all duration-1000 ease-out delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Don't waste another day trapped in addiction. Join thousands who've broken free and reclaimed their lives. Your transformation begins now.
          </p>
          
          <div 
            className={`flex flex-col sm:flex-row justify-center gap-4 transition-all duration-1000 ease-out delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Link
              href="https://apps.apple.com/rs/app/pureresist-quit-corn-now/id6745742828"
              className="bg-white text-black font-medium py-3 px-6 rounded-lg flex items-center justify-center hover:bg-gray-200 hover:transform hover:scale-105 hover:shadow-lg transition-all duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Apple Store
            </Link>
            <Link
              href="/waitlist"
              className="bg-white text-black font-medium py-3 px-6 rounded-lg flex items-center justify-center hover:bg-gray-200 hover:transform hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 512 512">
                <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
              </svg>
              Google Play
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BottomCTA; 