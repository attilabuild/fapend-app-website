import React from 'react';
import Link from 'next/link';

const BottomCTA = () => {
  return (
    <section className="w-full bg-black py-20" id="download">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Your All-in-One NoFap Companion
          </h2>
          <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
            Download now and start your journey to a better version of yourself. Join over 500,000 users who've transformed their lives.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/waitlist"
              className="bg-white text-black font-medium py-3 px-6 rounded-lg flex items-center justify-center hover:bg-gray-200 transition duration-300"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              App Store
            </Link>
            <Link
              href="/waitlist"
              className="bg-white text-black font-medium py-3 px-6 rounded-lg flex items-center justify-center hover:bg-gray-200 transition duration-300"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 20.5v-17c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v17l-7-3-7 3zm7-15c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
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