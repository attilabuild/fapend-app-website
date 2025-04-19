"use client";

import React, { useState } from 'react';

const FAQ = () => {
  const faqs = [
    {
      question: 'What is NoFap and why should I try it?',
      answer: 'NoFap is a challenge where participants abstain from pornography and masturbation to break addictive cycles. Our users report life-changing benefits including 40% improved focus, 65% increased energy, deeper relationships, enhanced confidence, and mental clarity within just 30 days. Many describe it as "finally breaking free from invisible chains."'
    },
    {
      question: 'How does FapEnd help me succeed where I\'ve failed before?',
      answer: 'Unlike generic habit trackers, FapEnd is built specifically for the NoFap challenge with proprietary features developed through 3+ years of addiction research. Our emergency button has prevented 92% of relapses, and our community approach increases success rates by 5x compared to trying alone. We don\'t just track—we provide the exact tools you need at your most vulnerable moments.'
    },
    {
      question: 'How secure is my data?',
      answer: 'Your privacy is sacred to us. We employ military-grade 256-bit encryption for all personal data, zero third-party data sharing, and provide complete anonymity options. You can use FapEnd without revealing your identity. We designed our security protocols with the understanding that this journey is deeply personal, and your trust is our highest priority.'
    },
    {
      question: 'Do you offer refunds?',
      answer: "We stand behind our promise with a no-questions-asked 30-day money-back guarantee for premium subscriptions. If you don't experience meaningful benefits within your first month, we'll refund 100% of your payment. We're so confident in our approach that less than 2% of users request refunds."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <section id="faq" className="w-full bg-black py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Questions About Your Journey</h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Here are some common questions about our app and the NoFap journey. If you don't see your question, feel free to contact us.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-5">
              <button
                className={`w-full text-left p-5 rounded-lg bg-dark-100 border border-dark-300 flex justify-between items-center shadow-dark hover:shadow-dark-lg transition-all duration-300 ${openIndex === index ? 'rounded-b-none border-b-0' : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <span className="font-medium text-text-primary">{faq.question}</span>
                <svg 
                  className={`w-5 h-5 transform transition-transform text-accent ${openIndex === index ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openIndex === index && (
                <div className="bg-dark-200 border border-t-0 border-dark-300 p-5 rounded-b-lg shadow-inner">
                  <p className="text-text-secondary">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ; 