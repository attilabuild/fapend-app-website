"use client";

import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { toast } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [state, handleSubmit] = useForm("mrbqgwwv");
  
  if (state.succeeded) {
    toast.success('Message sent successfully!');
  }

  return (
    <main className="flex min-h-screen flex-col bg-black">
      <Navbar />
      
      <div className="container mx-auto mt-12 mb-12 px-4 py-20 flex-grow">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">Contact Us</h1>
          <p className="text-lg text-gray-300 mb-10 text-center">
            Have questions about PureResist App? We're here to help you on your journey.
          </p>
          
          <div className="max-w-3xl mx-auto bg-gray-900 rounded-xl shadow-lg p-6 md:p-10">
            {state.succeeded ? (
              <div className="text-center p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 text-accent mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3">Message Sent!</h3>
                <p className="text-lg text-gray-300">
                  Thank you for reaching out. We'll get back to you as soon as possible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">Your Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="John Doe"
                      required
                    />
                    <ValidationError prefix="Name" field="name" errors={state.errors} className="mt-1 text-red-500 text-sm" />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="you@example.com"
                      required
                    />
                    <ValidationError prefix="Email" field="email" errors={state.errors} className="mt-1 text-red-500 text-sm" />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="How can we help you?"
                    required
                  />
                  <ValidationError prefix="Subject" field="subject" errors={state.errors} className="mt-1 text-red-500 text-sm" />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Please describe your question or feedback in detail..."
                    required
                  ></textarea>
                  <ValidationError prefix="Message" field="message" errors={state.errors} className="mt-1 text-red-500 text-sm" />
                </div>
                
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={state.submitting}
                    className="px-8 py-3 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-colors duration-300 disabled:opacity-70"
                  >
                    {state.submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
     
        </div>
      </div>
      
      <Footer />
    </main>
  );
} 