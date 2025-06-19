import React from 'react';
import Image from 'next/image';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Michael Johnson',
      avatar: '/micheal.jpg',
      text: 'I was stuck in this cycle for 5 years, feeling completely hopeless. PureResist gave me the tools I needed to break free. After 90 days, my energy levels skyrocketed and I finally got the job I\'d been dreaming of. The panic button literally saved me during those tough moments.',
      role: '5 years of struggle'
    },
    {
      name: 'James Chen',
      avatar: '/sarah.jpg',
      text: 'This app completely changed my life. I can actually see my progress with the analytics - my productivity doubled after 45 days. My relationships improved dramatically, and for the first time in years, I feel like I\'m in control of my own life. It\'s not just an app, it\'s freedom.',
      role: '45 days clean'
    },
    {
      name: 'David Martinez',
      avatar: '/david.jpg',
      text: 'The community support here is incredible. I maintained a 60-day streak thanks to the accountability features. I\'ve been sleeping better, gained 3 hours of productive time every day, and finally feel worthy of real relationships. This app is a game-changer.',
      role: '60 days strong'
    },
    {
      name: 'Alex Thompson',
      avatar: '/alex.jpg',
      text: 'I tried everything before this - therapy, books, other apps. Nothing worked until PureResist. The accountability features reduced my anxiety by 80% and helped me identify my exact triggers. After 75 days, the brain fog cleared and I rediscovered who I really am.',
      role: '75 days transformed'
    }
  ];  

  return (
    <section id="testimonials" className="w-full bg-black py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Real Stories, Real Results</h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Join thousands of people who have transformed their lives with PureResist. Here's what real users are saying about their journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-secondary p-6 rounded-lg border border-dark-300">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gradient-blue-start to-gradient-blue-mid mr-4 overflow-hidden flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.avatar ? (
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    testimonial.name.charAt(0)
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-300 italic leading-relaxed">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 