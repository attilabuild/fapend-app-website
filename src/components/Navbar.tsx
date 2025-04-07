"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-md py-3 shadow-md' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
        <img src='android-chrome-512x512.png' alt='Fapend Logo' className='w-10 h-10 mr-2'></img><h1>Fapend</h1>
        </Link>
        <div className="hidden md:flex space-x-8">
          <Link href="/" className="text-text-secondary hover:text-white transition-colors">Home</Link>
          <Link href="/features" className="text-text-secondary hover:text-white transition-colors">Features</Link>
          <Link href="/pricing" className="text-text-secondary hover:text-white transition-colors">Pricing</Link>
        </div>
        <div>
          <Link 
            href="/#download" 
            className="bg-gradient-to-r from-gradient-blue-start to-gradient-blue-mid text-white px-5 py-2.5 rounded-lg transition-all duration-300 hover:shadow-glow font-medium"
          >
            Download App
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 