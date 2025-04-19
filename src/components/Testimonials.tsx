import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Michael Johnson',
      avatar: '/avatars/avatar1.png',
      text: 'I\'ve been testing the beta version for 3 months and it\'s incredible. The streak counter and emergency motivation button helped me push through the toughest days. Can\'t wait for the full release!',
      role: 'Beta Tester since January 2025'
    },
    {
      name: 'Richard Chen',
      avatar: '/avatars/avatar2.png',
      text: 'The progress analytics in the beta are outstanding. Being able to see the correlation between my NoFap journey and productivity improvements has been eye-opening. Looking forward to the final version.',
      role: 'Early Access User'
    },
    {
      name: 'Emma Davis',
      avatar: '/avatars/avatar3.png',
      text: 'I\'ve been privileged to beta test this app, and I love how it focuses on holistic improvement - not just quitting a habit but building a better lifestyle. The community feature is my favorite part so far.',
      role: 'Beta Program Member'
    },
    {
      name: 'Carlos Ruiz',
      avatar: '/avatars/avatar4.png',
      text: 'As a beta tester, I\'ve found the accountability features and community forums invaluable when I was close to relapsing. Even in beta, this app has the best support system out there.',
      role: 'Premium Beta Tester'
    }
  ];  

  return (
    <section id="testimonials" className="w-full bg-black py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Beta Tester Feedback</h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Our beta program participants are already seeing amazing results. Here's what some of our early users have to say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-secondary p-6 rounded-lg">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-700 mr-4 overflow-hidden flex items-center justify-center text-xl font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-300 italic">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 