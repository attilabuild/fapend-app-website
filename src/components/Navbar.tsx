"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-md py-3 shadow-md' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <img src='/android-chrome-512x512.png' alt='Fapend Logo' className='w-10 h-10 mr-2'></img>
          <h1>Fapend</h1>
        </Link>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="/#hero" className="text-text-secondary hover:text-white transition-colors">Home</a>
          <a href="/#statistics" className="text-text-secondary hover:text-white transition-colors">Features</a>
          <a href="/#testimonials" className="text-text-secondary hover:text-white transition-colors">Testimonials</a>
          <a href="/#faq" className="text-text-secondary hover:text-white transition-colors">FAQ</a>
          <Link href="/contact" className="text-text-secondary hover:text-white transition-colors">Contact</Link>
        </div>

        <div className="hidden md:block">
          <Link 
            href="/waitlist" 
            className="bg-gradient-to-r from-gradient-blue-start to-gradient-blue-mid text-white px-5 py-2.5 rounded-lg transition-all duration-300 hover:shadow-glow font-medium"
          >
            Download App
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md py-4 px-4 shadow-lg">
          <div className="flex flex-col space-y-4">
            <a 
              href="/#hero" 
              className="text-text-secondary hover:text-white py-2 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </a>
            <a 
              href="/#statistics" 
              className="text-text-secondary hover:text-white py-2 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="/#testimonials" 
              className="text-text-secondary hover:text-white py-2 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Testimonials
            </a>
            <a 
              href="/#faq" 
              className="text-text-secondary hover:text-white py-2 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              FAQ
            </a>
            <Link 
              href="/contact" 
              className="text-text-secondary hover:text-white py-2 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>
            <Link 
              href="/waitlist" 
              className="bg-gradient-to-r from-gradient-blue-start to-gradient-blue-mid text-white px-5 py-2.5 rounded-lg transition-all duration-300 hover:shadow-glow font-medium text-center mt-2"
              onClick={() => setMenuOpen(false)}
            >
              Download App
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 