import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Michael Johnson',
      avatar: '/avatars/avatar1.png',
      text: 'This app has completely changed my life. The streak counter and emergency motivation button have helped me push through the toughest days. 120+ days and counting!',
      role: 'User since 2022'
    },
    {
      name: 'Richard Chen',
      avatar: '/avatars/avatar2.png',
      text: 'The progress analytics are incredible. Being able to see the correlation between my NoFap journey and productivity improvements has been eye-opening.',
      role: 'Premium Member'
    },
    {
      name: 'Emma Davis',
      avatar: '/avatars/avatar3.png',
      text: 'I appreciate how the app focuses on holistic improvement - not just quitting a habit but building a better lifestyle. The daily challenges and community support make all the difference.',
      role: 'User since 2021'
    },
    {
      name: 'Carlos Ruiz',
      avatar: '/avatars/avatar4.png',
      text: 'The accountability features and community forums helped me stay on track when I was close to relapsing. This app has the best support system out there.',
      role: 'NoFap Champion'
    }
  ];

  return (
    <section className="w-full bg-primary py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What they say about us</h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Thousands of users have transformed their lives with our app. Here's what some of them have to say.
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