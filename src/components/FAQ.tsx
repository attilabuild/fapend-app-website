"use client";

import React, { useState } from 'react';

const FAQ = () => {
  const faqs = [
    {
      question: 'What is NoFap and why should I try it?',
      answer: 'NoFap is a challenge where participants abstain from pornography and masturbation. Many users report benefits including improved focus, increased energy, better relationships, and enhanced mental clarity.'
    },
    {
      question: 'How does the app help with NoFap?',
      answer: 'Our app provides streak tracking, emergency motivation, community support, progress analytics, and psychological tools to help you overcome urges and build healthy habits.'
    },
    {
      question: 'Can I use the app for free?',
      answer: 'Yes! Our basic features including streak tracking, emergency motivation, and basic stats are completely free. Premium features are available through subscription plans.'
    },
    {
      question: 'How secure is my data?',
      answer: 'We take privacy extremely seriously. All personal data is encrypted, and we never share your information with third parties. You can also use the app anonymously.'
    },
    {
      question: 'Do you offer refunds?',
      answer: "Yes, we offer a 14-day money-back guarantee if you're not satisfied with the premium features. Simply contact our support team."
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
          <h2 className="section-title">Let's Answer Your Questions</h2>
          <p className="section-subtitle">
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