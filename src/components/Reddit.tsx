"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const Reddit = () => {
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
    <section ref={sectionRef} className="w-full bg-black py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className={`text-3xl md:text-4xl font-bold mb-6 transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Join Our Reddit Community
          </h2>
          <p className={`text-lg text-gray-300 mb-10 max-w-2xl mx-auto transition-all duration-1000 ease-out delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Connect with our growing Reddit community. Share your journey, get advice, and find support from others who understand your struggle.
          </p>
          
          <div className={`bg-secondary p-8 rounded-lg border border-dark-300 max-w-2xl mx-auto transition-all duration-1000 ease-out delay-500 hover:transform hover:scale-105 hover:shadow-xl ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-[#FF4500] rounded-full mr-4 flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
                <span className="text-white text-3xl font-bold">r/</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">r/PureResist</h3>
                <p className="text-gray-400">Join our Reddit community</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center text-gray-300">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Share your progress and milestones
              </div>
              <div className="flex items-center text-gray-300">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Get advice from experienced members
              </div>
              <div className="flex items-center text-gray-300">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Discuss strategies and techniques
              </div>
              <div className="flex items-center text-gray-300">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Find motivation and inspiration
              </div>
            </div>
            
            <Link
              href="https://www.reddit.com/r/pureresist/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FF4500] hover:bg-[#E03D00] text-white font-medium py-3 px-8 rounded-lg flex items-center justify-center transition-all duration-300 w-full hover:transform hover:scale-105 hover:shadow-lg"
            >
              <span className="text-xl font-bold mr-2">r/</span>
              Join Reddit Community
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reddit; 