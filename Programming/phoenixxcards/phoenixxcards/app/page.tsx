import Image from "next/image";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-bg text-text-light">
      <Navbar />
      {/* Hero Section */}
      <main>
        <section className="relative min-h-screen flex items-center justify-center bg-dark-bg px-4 py-20 pt-24" role="banner" aria-labelledby="hero-heading">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-bg-secondary to-dark-bg opacity-50"></div>
        
        {/* Phoenix/Flame Visual */}
        <div className="absolute top-20 right-10 opacity-20 float-animation">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" fill="#e63946"/>
            <path d="M12 6C13.1 6 14 6.9 14 8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8C10 6.9 10.9 6 12 6Z" fill="#ff4444"/>
            <path d="M12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10Z" fill="#dc2626"/>
            <path d="M12 14C13.1 14 14 14.9 14 16C14 17.1 13.1 18 12 18C10.9 18 10 17.1 10 16C10 14.9 10.9 14 12 14Z" fill="#b91c1c"/>
            <path d="M12 18C13.1 18 14 18.9 14 20C14 21.1 13.1 22 12 22C10.9 22 10 21.1 10 20C10 18.9 10.9 18 12 18Z" fill="#991b1b"/>
          </svg>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 id="hero-heading" className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-primary to-red-secondary bg-clip-text text-transparent">
            Phoenix Cards
          </h1>
          <p className="text-xl md:text-2xl text-text-muted mb-8 max-w-2xl mx-auto">
            Ignite your learning with our revolutionary flashcard system. 
            Rise from the ashes of traditional study methods.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-red-primary hover:bg-red-secondary text-white font-semibold py-4 px-8 rounded-lg text-lg glow-effect transform hover:scale-105 transition-all duration-300">
              Start Learning Now
            </button>
            <button className="border border-red-primary text-red-primary hover:bg-red-primary hover:text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Key Benefits / Features */}
      <section id="features" className="py-20 bg-dark-bg-secondary px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-text-light">
            Why Choose <span className="text-red-primary">Phoenix Cards</span>?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔥",
                title: "Smart Spaced Repetition",
                description: "Our AI-powered algorithm adapts to your learning pace, ensuring optimal retention."
              },
              {
                icon: "⚡",
                title: "Lightning Fast",
                description: "Study anywhere, anytime with our responsive design and offline capabilities."
              },
              {
                icon: "🎯",
                title: "Personalized Learning",
                description: "Track your progress and focus on areas that need the most attention."
              },
              {
                icon: "📊",
                title: "Detailed Analytics",
                description: "Get insights into your learning patterns and performance metrics."
              },
              {
                icon: "🔄",
                title: "Sync Across Devices",
                description: "Your progress follows you everywhere - phone, tablet, and computer."
              },
              {
                icon: "🏆",
                title: "Achievement System",
                description: "Stay motivated with badges, streaks, and learning milestones."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-dark-bg-tertiary p-6 rounded-lg border border-gray-800 hover:border-red-primary transition-all duration-300 hover:transform hover:scale-105">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-text-light">{feature.title}</h3>
                <p className="text-text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-dark-bg px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-text-light">
            How It <span className="text-red-primary">Works</span>
          </h2>
          
          <div className="space-y-12">
            {[
              {
                step: "1",
                title: "Create Your Cards",
                description: "Build custom flashcards with text, images, and audio. Import from existing decks or start from scratch."
              },
              {
                step: "2",
                title: "Study Smart",
                description: "Our spaced repetition system shows you cards at the perfect intervals for maximum retention."
              },
              {
                step: "3",
                title: "Track Progress",
                description: "Monitor your learning journey with detailed analytics and performance insights."
              },
              {
                step: "4",
                title: "Master & Excel",
                description: "Achieve mastery through consistent practice and watch your knowledge grow exponentially."
              }
            ].map((step, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-red-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3 text-text-light">{step.title}</h3>
                  <p className="text-text-muted text-lg">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      <section id="testimonials" className="py-20 bg-dark-bg-secondary px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-text-light">
            What Our <span className="text-red-primary">Users</span> Say
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Medical Student",
                content: "Phoenix Cards transformed my study routine. I've improved my retention by 300%!",
                rating: 5
              },
              {
                name: "Marcus Rodriguez",
                role: "Language Learner",
                content: "The spaced repetition is incredible. I'm learning Spanish faster than ever before.",
                rating: 5
              },
              {
                name: "Dr. Emily Watson",
                role: "Professor",
                content: "I recommend Phoenix Cards to all my students. The results speak for themselves.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-dark-bg-tertiary p-6 rounded-lg border border-gray-800 hover:border-red-primary transition-all duration-300">
                <div className="flex text-red-primary mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-xl">★</span>
                  ))}
                </div>
                <p className="text-text-muted mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-text-light">{testimonial.name}</p>
                  <p className="text-red-primary text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-dark-bg px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-text-light">
            Simple <span className="text-red-primary">Pricing</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                features: [
                  "Up to 100 flashcards",
                  "Basic spaced repetition",
                  "Mobile app access",
                  "Community support"
                ],
                cta: "Get Started Free",
                popular: false
              },
              {
                name: "Pro",
                price: "$9.99",
                period: "per month",
                features: [
                  "Unlimited flashcards",
                  "Advanced analytics",
                  "Custom study schedules",
                  "Priority support",
                  "Export to PDF",
                  "Audio flashcards"
                ],
                cta: "Start Pro Trial",
                popular: true
              },
              {
                name: "Team",
                price: "$29.99",
                period: "per month",
                features: [
                  "Everything in Pro",
                  "Team collaboration",
                  "Progress tracking",
                  "Admin dashboard",
                  "API access",
                  "Custom branding"
                ],
                cta: "Contact Sales",
                popular: false
              }
            ].map((plan, index) => (
              <div key={index} className={`bg-dark-bg-tertiary p-8 rounded-lg border ${plan.popular ? 'border-red-primary ring-2 ring-red-primary/20' : 'border-gray-800'} hover:border-red-primary transition-all duration-300 relative`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-red-primary text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-text-light mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-red-primary">{plan.price}</span>
                    <span className="text-text-muted">/{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-text-muted">
                      <span className="text-red-primary mr-3">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                  plan.popular 
                    ? 'bg-red-primary hover:bg-red-secondary text-white' 
                    : 'border border-red-primary text-red-primary hover:bg-red-primary hover:text-white'
                }`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-dark-bg-secondary px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-text-light">
            Ready to <span className="text-red-primary">Transform</span> Your Learning?
          </h2>
          <p className="text-xl text-text-muted mb-8">
            Join thousands of learners who have already elevated their study game with Phoenix Cards.
          </p>
          <button className="bg-red-primary hover:bg-red-secondary text-white font-semibold py-4 px-8 rounded-lg text-lg glow-effect transform hover:scale-105 transition-all duration-300">
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-bg-secondary py-12 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-red-primary mb-4">Phoenix Cards</h3>
              <p className="text-text-muted">
                Igniting learning through intelligent flashcard technology.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-text-light mb-4">Product</h4>
              <ul className="space-y-2 text-text-muted">
                <li><a href="#" className="hover:text-red-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-red-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-red-primary transition-colors">API</a></li>
                <li><a href="#" className="hover:text-red-primary transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-text-light mb-4">Support</h4>
              <ul className="space-y-2 text-text-muted">
                <li><a href="#" className="hover:text-red-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-red-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-red-primary transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-red-primary transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-text-light mb-4">Company</h4>
              <ul className="space-y-2 text-text-muted">
                <li><a href="#" className="hover:text-red-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-red-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-red-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-red-primary transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-text-muted">
            <p>&copy; 2024 Phoenix Cards. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </main>
    </div>
  );
}
