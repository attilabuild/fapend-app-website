import React from 'react';
import Link from 'next/link';

const Reddit = () => {
  return (
    <section className="w-full bg-black py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join Our Reddit Community
          </h2>
          <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
            Connect with our growing Reddit community. Share your journey, get advice, and find support from others who understand your struggle.
          </p>
          
          <div className="bg-secondary p-8 rounded-lg border border-dark-300 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-[#FF4500] rounded-full mr-4 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">r/</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">r/PureResist</h3>
                <p className="text-gray-400">Join our Reddit community</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center text-gray-300">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Share your progress and milestones
              </div>
              <div className="flex items-center text-gray-300">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Get advice from experienced members
              </div>
              <div className="flex items-center text-gray-300">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Discuss strategies and techniques
              </div>
              <div className="flex items-center text-gray-300">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Find motivation and inspiration
              </div>
            </div>
            
            <Link
              href="https://www.reddit.com/r/pureresist/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FF4500] hover:bg-[#E03D00] text-white font-medium py-3 px-8 rounded-lg flex items-center justify-center transition duration-300 w-full"
            >
              <span className="text-xl font-bold mr-2">r/</span>
              Join Reddit Community
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reddit; 