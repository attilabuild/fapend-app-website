"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Hero = () => {
  return (
    <section className="w-full bg-primary py-28">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-16">
          {/* Left side - App Mockup */}
          <div className="order-2 md:order-1 flex justify-center relative">
            <div className="mobile-mockup">
              <div className="absolute top-24 left-20 w-60 h-60 bg-gradient-purple-mid rounded-full filter blur-[100px] opacity-20"></div>
              <div className="absolute -bottom-10 right-0 w-40 h-40 bg-gradient-blue-start rounded-full filter blur-[80px] opacity-20"></div>
              
              <div className="mobile-mockup-inner mx-auto">
                <div className="phone-notch"></div>
                <div className="phone-preview">
                  {/* Status Bar */}
                  <div className="phone-status-bar">
                    <span>9:41</span>
                    <div className="flex space-x-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* App Screen */}
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h3 className="text-xl font-bold text-white">NoFap</h3>
                        <p className="text-text-secondary text-xs">Welcome back, Alex</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-dark-200 border border-dark-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="bg-dark-100 rounded-xl p-4 mb-5">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-sm font-semibold">Current Streak</h4>
                        <span className="text-xs text-accent">Best: 47 days</span>
                      </div>
                      <div className="flex items-center">
                        <div className="text-4xl font-bold text-white mr-2">30</div>
                        <div className="text-text-secondary text-sm">days</div>
                      </div>
                      <div className="mt-3 w-full bg-dark-300 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-gradient-blue-start to-gradient-blue-mid h-1.5 rounded-full" style={{ width: '64%' }}></div>
                      </div>
                    </div>
                    
                    <h4 className="text-sm font-semibold mb-3">Daily Progress</h4>
                    <div className="bg-dark-100 rounded-xl p-4 mb-5">
                      <div className="flex h-20 items-end space-x-1">
                        {[40, 60, 50, 70, 80, 65, 90].map((height, i) => (
                          <div key={i} className="flex-1">
                            <div 
                              className="bg-gradient-to-t from-gradient-blue-mid to-gradient-blue-start rounded-t-sm" 
                              style={{ height: `${height}%` }}
                            ></div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-text-secondary">Mon</span>
                        <span className="text-xs text-text-secondary">Sun</span>
                      </div>
                    </div>
                    
                    <h4 className="text-sm font-semibold mb-3">Benefits Gained</h4>
                    <div className="bg-dark-100 rounded-xl p-4">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-xs text-text-secondary">Energy levels increased</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-xs text-text-secondary">Productivity improved</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-xs text-text-secondary">Confidence boosted</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="phone-screen-reflection"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Text Content */}
          <div className="order-1 md:order-2 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text">
              Your All-in-One<br />NoFap Companion
            </h1>
            <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto md:mx-0">
              Track your progress, get daily motivation, set goals, and join a supportive community on your journey to self-improvement.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-5 mb-12">
              <a 
                href="https://apps.apple.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <svg className="w-6 h-6 mr-2 inline-block" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                App Store
              </a>
              <a 
                href="https://play.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <svg className="w-6 h-6 mr-2 inline-block" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 20.5v-17c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v17l-7-3-7 3zm7-15c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
                Google Play
              </a>
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