'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest('header')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);
  
  return (
    <div className="min-h-screen bg-white scroll-smooth">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mr-3 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">VF</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">VastusFix</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm lg:text-base">Why Choose Us</a>
              <a href="#packages" className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm lg:text-base">Packages</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm lg:text-base">How It Works</a>
              <a href="#screenshots" className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm lg:text-base">Screenshots</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm lg:text-base">Contact</a>
            </nav>
            
            <div className="flex items-center space-x-3">
              <a href="https://t.me/vastusfixedd" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-block bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-green-500/30 text-sm lg:text-base">
                Get Free Match
              </a>
              
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className={`md:hidden border-t border-gray-200 transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
            <nav className="flex flex-col space-y-1 py-4">
              <a 
                href="#features" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors py-3 px-4 rounded-lg flex items-center"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Why Choose Us
              </a>
              <a 
                href="#packages" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 hover:bg-green-50 font-medium transition-colors py-3 px-4 rounded-lg flex items-center"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Packages
              </a>
              <a 
                href="#how-it-works" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 hover:bg-purple-50 font-medium transition-colors py-3 px-4 rounded-lg flex items-center"
              >
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                How It Works
              </a>
              
              <a 
                href="#screenshots" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 hover:bg-pink-50 font-medium transition-colors py-3 px-4 rounded-lg flex items-center"
              >
                <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                Screenshots
              </a>
              
              <a 
                href="#contact" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 hover:bg-yellow-50 font-medium transition-colors py-3 px-4 rounded-lg flex items-center"
              >
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                Contact
              </a>
              
              {/* Mobile CTA Button */}
              <div className="pt-4 border-t border-gray-100 mt-4">
                <a 
                  href="https://t.me/vastusfixedd" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-all text-center inline-block"
                >
                  📩 Get Free Match
                </a>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen bg-white overflow-hidden -mt-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDU5LCA5MywgMTk2LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        
        {/* Floating Background Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-32 left-20 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute top-1/2 right-10 w-32 h-32 bg-green-100 rounded-full blur-2xl opacity-70"></div>
        
        <div className="relative z-10 container mx-auto px-4 min-h-screen flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            
            {/* Left Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center bg-green-50 border border-green-200 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm font-semibold text-green-700">100% Verified Fixed Matches</span>
              </div>
              
              {/* Main Headline */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900">
                <span className="block">Get A Free Match</span>
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  From VastusFix
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-xl">
                At VastusFix, we provide <span className="font-semibold text-blue-600">verified fixed matches</span> with a proven success record from <span className="font-semibold text-purple-600">trusted insider sources</span>.
              </p>
              
              {/* Features List */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">Real insider information, no guessing</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">Instant delivery via Telegram</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">24/7 support and secure payments</span>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://t.me/vastusfixedd" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r text-center justify-center from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-green-500/30 inline-block">
                  📩 Get Your Free Match Now
                </a>
                
                <a href="https://t.me/vastusfixedd" target="_blank" rel="noopener noreferrer" className="bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 flex items-center space-x-3 hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Contact on Telegram</div>
                    <div className="font-semibold text-blue-600">@vastusfixedd</div>
                  </div>
                </a>
              </div>
            </div>
            
            {/* Right Visual */}
            <div className="relative lg:ml-8 flex justify-center">
              <img 
                src="/dataset-card.png" 
                alt="VastusFix Dataset Card" 
                className="max-w-full h-auto rounded-2xl"
              />
            </div>
            
          </div>
        </div>
      </section>

      {/* Why Choose VastusFix Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose VastusFix?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real results, no guessing. Transparent proof with multiple packages for every budget.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Real Results</h3>
              <p className="text-gray-600">Only matches with insider confirmation. No guessing, just winning.</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Transparent Proof</h3>
              <p className="text-gray-600">Every prediction backed by evidence from past wins and screenshots.</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="text-xl font-bold mb-3">First Match Free</h3>
              <p className="text-gray-600">New clients get their first verified match completely free, risk-free.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Packages & How It Works Combined Section */}
      <section id="packages" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              💎 Premium Packages
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Choose Your Winning Package
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get verified fixed matches with proven success rates. Choose your package, pay securely, 
              and receive your match instantly via Telegram.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {/* Basic Package */}
            <div className="bg-white rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Basic</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-blue-600">$100</span>
                <span className="text-gray-500 text-lg ml-2">/match</span>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                <p className="text-blue-800 font-semibold mb-2">What's included:</p>
                <ul className="text-left space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    1 verified fixed match
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Instant Telegram delivery
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Basic support
                  </li>
                </ul>
              </div>
              <a href="https://t.me/vastusfixedd" target="_blank" rel="noopener noreferrer" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/30 inline-block">
                Choose Basic
              </a>
            </div>

            {/* Pro Package */}
            <div className="bg-white rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg mt-4">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Pro</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">$200</span>
                <span className="text-gray-500 text-lg ml-2">/package</span>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 mb-6">
                <p className="text-blue-800 font-semibold mb-2">What's included:</p>
                <ul className="text-left space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    1 verified fixed
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Higher odds selection
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Detailed analysis
                  </li>
                </ul>
              </div>
              <a href="https://t.me/vastusfixedd" target="_blank" rel="noopener noreferrer" className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/30 inline-block">
                Choose Pro
              </a>
            </div>

            {/* VIP Package */}
            <div className="bg-white rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">VIP</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent">$300</span>
                <span className="text-gray-500 text-lg ml-2">/package</span>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 mb-6">
                <p className="text-orange-800 font-semibold mb-2">What's included:</p>
                <ul className="text-left space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    1 verified fixed match
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Full insider details
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    VIP support 24/7
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Exclusive high-odds matches
                  </li>
                </ul>
              </div>
              <a href="https://t.me/vastusfixedd" target="_blank" rel="noopener noreferrer" className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-yellow-500/30 inline-block">
                Choose VIP
              </a>
            </div>
          </div>

          {/* How It Works Steps */}
          <div id="how-it-works" className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-bold mb-2">Choose Package</h3>
              <p className="text-gray-600 text-sm">Select Basic, Pro, or VIP</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-green-600">2</span>
              </div>
              <h3 className="font-bold mb-2">Send Payment</h3>
              <p className="text-gray-600 text-sm">Secure crypto transfer</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-bold mb-2">Get Match</h3>
              <p className="text-gray-600 text-sm">Instant Telegram delivery</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-yellow-600">4</span>
              </div>
              <h3 className="font-bold mb-2">Win Big</h3>
              <p className="text-gray-600 text-sm">Watch your profits grow</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-[#1e5bb8] to-[#4dabf7] text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Your next win is just here
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Don't gamble blindly. Make every bet a calculated win.
            </p>
            
            <a href="https://t.me/vastusfixedd" target="_blank" rel="noopener noreferrer" className="bg-[#10c646] hover:bg-green-600 text-white px-10 py-4 rounded-xl font-bold text-xl transition-all transform hover:scale-105 mb-6 inline-block">
              📩 Get Your Free Match Now
            </a>

            <p className="text-lg opacity-90">
              Telegram: <span className="font-semibold">@vastusfixedd</span>
            </p>
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section id="screenshots" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              📸 Real Results
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Proof of Our Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See real screenshots of our winning predictions and satisfied customers. These are just a few examples of our daily successful matches.
            </p>
          </div>

          {/* Screenshots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Row A Screenshots */}
            <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <img 
                src="/x/a1.jpg" 
                alt="Winning Bet Screenshot 1" 
                className="w-full object-contain rounded-xl mb-4 max-h-80"
              />
              <div className="text-center">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                  ✅ Verified Win
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <img 
                src="/x/a2.jpg" 
                alt="Winning Bet Screenshot 2" 
                className="w-full object-contain rounded-xl mb-4 max-h-80"
              />
              <div className="text-center">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                  ✅ Verified Win
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <img 
                src="/x/a3.jpg" 
                alt="Winning Bet Screenshot 3" 
                className="w-full object-contain rounded-xl mb-4 max-h-80"
              />
              <div className="text-center">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                  ✅ Verified Win
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <img 
                src="/x/a4.jpg" 
                alt="Winning Bet Screenshot 4" 
                className="w-full object-contain rounded-xl mb-4 max-h-80"
              />
              <div className="text-center">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                  ✅ Verified Win
                </div>
              </div>
            </div>

            {/* Row B Screenshots */}
            <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <img 
                src="/x/b1.jpg" 
                alt="Customer Testimonial Screenshot 1" 
                className="w-full object-contain rounded-xl mb-4 max-h-80"
              />  
              <div className="text-center">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                  💬 Verified Win
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <img 
                src="/x/b2.jpg" 
                alt="Customer Testimonial Screenshot 2" 
                className="w-full object-contain rounded-xl mb-4 max-h-80"
              />
              <div className="text-center">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                  💬 Verified Win
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <img 
                src="/x/b3.jpg" 
                alt="Customer Testimonial Screenshot 3" 
                className="w-full object-contain rounded-xl mb-4 max-h-80"
              />
              <div className="text-center">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                  💬 Verified Win
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <img 
                src="/x/b4.jpg" 
                alt="Customer Testimonial Screenshot 4" 
                className="w-full object-contain rounded-xl mb-4 max-h-80"
              />
              <div className="text-center">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                  💬 Verified Win
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <img 
                src="/x/b5.jpg" 
                alt="Customer Testimonial Screenshot 5" 
                className="w-full object-contain rounded-xl mb-4 max-h-80"
              />
              <div className="text-center">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                  💬 Verified Win
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to Join Our Winners?
              </h3>
              <p className="text-green-100 mb-6 text-lg">
                These screenshots represent just a fraction of our daily success. Start your winning streak today!
              </p>
              <a 
                href="https://t.me/vastusfixedd" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-white text-green-600 hover:text-green-700 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Get Your Winning Screenshots
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br bg-white text-black">
        <div className="container mx-auto px-4">
          {/* Main Footer Content */}
          <div className="py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              
              {/* Company Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mr-4 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">VF</span>
                  </div>
                  <span className="text-3xl font-bold">VastusFix</span>
                </div>
                
                <p className="text-black text-lg mb-6 leading-relaxed max-w-md">
                  The most trusted source for 100% verified fixed matches. Operating since 2007 with 370+ successful matches and proven track record.
                </p>
                
                <div className="flex flex-col space-y-4">
                  <a href="https://t.me/vastusfixedd" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg inline-flex items-center w-fit">
                    <span className="mr-2">📩</span>
                    Join Our Telegram Channel
                  </a>
                  
                  <div className="flex items-center space-x-2 text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">981+ active subscribers</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Links */}
              <div>
                <h3 className="text-xl font-bold mb-6">Quick Links</h3>
                <ul className="space-y-4">
                  <li>
                    <a href="#features" className="text-black hover:text-white transition-colors flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></span>
                      Why Choose Us
                    </a>
                  </li>
                  <li>
                    <a href="#packages" className="text-black hover:text-white transition-colors flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></span>
                      Packages & Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#how-it-works" className="text-black hover:text-white transition-colors flex items-center">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3"></span>
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a href="#contact" className="text-black hover:text-white transition-colors flex items-center">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-3"></span>
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>
              
              {/* Services */}
              <div>
                <h3 className="text-xl font-bold mb-6">Our Services</h3>
                <ul className="space-y-4">
                  <li className="flex items-center text-black">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Fixed Match Tips
                  </li>
                  <li className="flex items-center text-black">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Insider Information
                  </li>
                  <li className="flex items-center text-black">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    24/7 Support
                  </li>
                  <li className="flex items-center text-black">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Secure Payments
                  </li>
                </ul>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl border border-green-500/20">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl font-bold text-green-500">98%</span>
                    <span className="text-sm text-black  ml-2">Success Rate</span>
                  </div>
                  <p className="text-xs text-black">Since 2018</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-700 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
                <p className="text-sm text-gray-400">   
                  © 2024 VastusFix. All rights reserved.
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>🔒 Secure Crypto Payments</span>
                  <span>•</span>
                  <span>✅ Verified Since 2007</span>
                  <span>•</span>
                  <span>📱 Telegram: @vastusfixedd</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400">Online Now</span>
                </div>
                <a href="https://t.me/vastusfixedd" target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.61 7.594c-.12.567-.44.706-.892.44l-2.463-1.816-1.187 1.138c-.131.131-.243.243-.5.243l.178-2.53 4.663-4.206c.203-.18-.044-.281-.315-.101L9.32 11.19l-2.367-.741c-.515-.16-.527-.515.108-.764L20.543 6.24c.429-.16.804.1.663.764-.001 0-.001 0-.001 0z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/vastusfixed/?igsh=NW95OWxyNW5tcTM5&fbclid=IwY2xjawMKkB1leHRuA2FlbQIxMABicmlkETFqNDY1SmJubWxTUDhFbEVHAR7A6jQpPnXT4ljcR8dMHahv0x9ORI1omyCzkhrWIoAW0u4pQm6JyCQ2paPb7A_aem_3-Fy6Pvk7rramXcSw5CnTQ" target="_blank" rel="noopener noreferrer" className="bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://www.tiktok.com/@vastusfix?fbclid=IwY2xjawMKkB5leHRuA2FlbQIxMABicmlkETFqNDY1SmJubWxTUDhFbEVHAR7TZgKPy8WQesqG-1ujAyXqcCZ_YPzLoOniWSe_zGD9ZoRn1q36HuMumKOEsA_aem_sdUHgp8Cx1zrSfC02xbRrQ" target="_blank" rel="noopener noreferrer" className="bg-black hover:bg-gray-800 text-white p-2 rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}