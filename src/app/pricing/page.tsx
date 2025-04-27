"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PricingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-black">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20 flex-grow">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the plan that works best for you with no hidden fees.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-accent transition-all duration-300 flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Free</h3>
                <p className="text-gray-400 mb-4">Perfect to get started</p>
                <div className="flex items-end">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Basic content filters</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Up to 5 accounts</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Standard analytics</span>
                </li>
                <li className="flex items-start text-gray-500">
                  <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>No priority support</span>
                </li>
              </ul>
              
              <button className="w-full py-3 px-4 bg-transparent border border-accent text-accent hover:bg-accent hover:text-white rounded-lg font-medium transition-colors duration-300">
                Get Started
              </button>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-primary rounded-2xl p-8 border-2 border-accent shadow-lg shadow-accent/20 flex flex-col relative transform md:scale-105 z-10">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-accent text-black px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Pro</h3>
                <p className="text-gray-400 mb-4">For serious users</p>
                <div className="flex items-end">
                  <span className="text-4xl font-bold">$9.99</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Advanced content filters</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Up to 25 accounts</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Priority email support</span>
                </li>
              </ul>
              
              <button className="w-full py-3 px-4 bg-accent hover:bg-accent-dark text-white rounded-lg font-medium transition-colors duration-300">
                Get Started
              </button>
            </div>
            
            {/* Enterprise Plan */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-accent transition-all duration-300 flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
                <p className="text-gray-400 mb-4">For teams and businesses</p>
                <div className="flex items-end">
                  <span className="text-4xl font-bold">$29.99</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Premium content filters</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Unlimited accounts</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Enterprise analytics</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>24/7 priority support</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Custom integrations</span>
                </li>
              </ul>
              
              <button className="w-full py-3 px-4 bg-transparent border border-accent text-accent hover:bg-accent hover:text-white rounded-lg font-medium transition-colors duration-300">
                Contact Sales
              </button>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold mb-10 text-center">Frequently Asked Questions</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-gray-900 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">Can I change plans later?</h3>
                <p className="text-gray-300">Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle.</p>
              </div>
              
              <div className="bg-gray-900 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">Is there a free trial?</h3>
                <p className="text-gray-300">Yes, all paid plans come with a 14-day free trial so you can test out all features before committing.</p>
              </div>
              
              <div className="bg-gray-900 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">Do you offer refunds?</h3>
                <p className="text-gray-300">We offer a 30-day money-back guarantee if you're not satisfied with our service for any reason.</p>
              </div>
              
              <div className="bg-gray-900 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">Do you offer discounts?</h3>
                <p className="text-gray-300">We offer special pricing for educational institutions and non-profit organizations. Contact our sales team for more information.</p>
              </div>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="mt-20 text-center bg-gradient-to-r from-primary to-gray-900 rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied users who have already improved their social media experience with PureResist App.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-accent hover:bg-accent-dark text-white rounded-lg font-medium transition-colors duration-300">
                Get Started
              </button>
              <button className="px-8 py-3 bg-transparent border border-white text-white hover:bg-white/10 rounded-lg font-medium transition-colors duration-300">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
} 