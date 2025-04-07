import React from 'react';

const Statistics = () => {
  return (
    <section className="w-full bg-black py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-primary p-8 rounded-lg text-center">
            <h3 className="text-5xl font-bold mb-2 text-accent">100+</h3>
            <p className="text-xl">Countries</p>
            <p className="text-gray-400 mt-2 text-sm">Supporting users around the world with localized content and community features</p>
          </div>
          
          <div className="bg-primary p-8 rounded-lg text-center">
            <h3 className="text-5xl font-bold mb-2 text-accent">542,000+</h3>
            <p className="text-xl">Users</p>
            <p className="text-gray-400 mt-2 text-sm">Growing community of people committed to self-improvement and breaking free from addiction</p>
          </div>
          
          <div className="bg-primary p-8 rounded-lg text-center">
            <h3 className="text-5xl font-bold mb-2 text-accent">4.8</h3>
            <p className="text-xl">Star Rating</p>
            <p className="text-gray-400 mt-2 text-sm">Highly rated and trusted by our users with thousands of positive reviews</p>
          </div>
        </div>
        
        <div className="mt-20 max-w-4xl mx-auto bg-primary p-6 md:p-8 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Available in every country</h3>
              <p className="text-gray-300 mb-4">
                Our app is accessible worldwide, with custom features and language support for diverse regions and cultures.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {['USA', 'Canada', 'UK', 'Australia', 'Germany', 'France', 'India'].map((country, index) => (
                  <span key={index} className="bg-secondary px-3 py-1 rounded-full text-sm">
                    {country}
                  </span>
                ))}
                <span className="bg-secondary px-3 py-1 rounded-full text-sm">+93 more</span>
              </div>
            </div>
            <div>
              <div className="relative h-full min-h-[200px] flex items-center justify-center">
                <div className="w-40 h-40 rounded-full bg-secondary flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-accent bg-opacity-20 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-accent bg-opacity-40 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Statistics; 