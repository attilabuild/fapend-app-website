import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Michael Johnson',
      avatar: '/avatars/avatar1.png',
      text: 'Before FapEnd, I was trapped in a cycle of addiction for 5 years. After 90 days with the beta, my energy levels increased by 70% and I finally landed my dream job. The emergency button saved me at least 20 times when urges were unbearable.',
      role: 'Beta Tester since January 2025'
    },
    {
      name: 'Richard Chen',
      avatar: '/avatars/avatar2.png',
      text: 'The beta analytics transformed my approach to recovery. I can actually see how my productivity doubled after 45 days. My relationships improved, and for the first time in years, I feel in control instead of controlled. This isn\'t just an app. It\'s freedom.',
      role: 'Early Access User'
    },
    {
      name: 'Emma Davis',
      avatar: '/avatars/avatar3.png',
      text: 'Testing this app changed my perspective on addiction recovery. With the community support, I maintained a 60-day streak. I\'ve slept better, gained 3 hours of productive time daily, and finally feel worthy of real connection. Can\'t wait for the full release!',
      role: 'Beta Program Member'
    },
    {
      name: 'Carlos Ruiz',
      avatar: '/avatars/avatar4.png',
      text: 'As someone who relapsed 15+ times before, this beta is revolutionary. The accountability features reduced my anxiety by 80% and gave me tools to identify my exact triggers. After 75 days, my brain fog cleared, and I\'ve reconnected with who I really am. Life-changing isn\'t an exaggeration.',
      role: 'Premium Beta Tester'
    }
  ];  

  return (
    <section id="testimonials" className="w-full bg-black py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Real Results from Beta Users</h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Our beta testers aren't just testing an app—they're experiencing profound transformation. Here's what real people are achieving.
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