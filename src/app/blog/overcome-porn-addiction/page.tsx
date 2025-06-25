import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'How to Overcome Porn Addiction: Step-by-Step Recovery Plan & Treatment | PureResist',
  description: 'Learn how to overcome porn addiction with our step-by-step recovery plan. Get proven strategies, treatment methods, and support to break free from porn addiction.',
  keywords: ['how to overcome porn addiction', 'porn addiction recovery', 'porn addiction treatment', 'overcome porn addiction', 'porn addiction help', 'addiction recovery', 'PureResist'],
  openGraph: {
    title: 'How to Overcome Porn Addiction: Step-by-Step Recovery Plan & Treatment',
    description: 'Learn how to overcome porn addiction with our step-by-step recovery plan. Get proven strategies, treatment methods, and support.',
    type: 'article',
    url: 'https://www.pureresist.com/blog/overcome-porn-addiction',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Overcome Porn Addiction: Step-by-Step Recovery Plan & Treatment',
    description: 'Learn how to overcome porn addiction with our step-by-step recovery plan. Get proven strategies, treatment methods, and support.',
  },
  alternates: {
    canonical: 'https://www.pureresist.com/blog/overcome-porn-addiction',
  },
};

export default function OvercomePornAddictionPage() {
  return (
    <main className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <article className="container mx-auto px-4 py-20 mt-16 flex-grow">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li>/</li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li>/</li>
              <li className="text-white">How to Overcome Porn Addiction</li>
            </ol>
          </nav>

          {/* Article Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-sm font-medium">Recovery</span>
              <span className="text-gray-400 text-sm">15 min read</span>
              <span className="text-gray-400 text-sm">January 25, 2024</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              How to Overcome Porn Addiction: A Comprehensive Step-by-Step Recovery Plan
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Porn addiction affects millions of people worldwide, silently eroding relationships, self-esteem, and life satisfaction. This comprehensive guide provides evidence-based strategies to break free from this destructive habit and rebuild a healthier, more fulfilling life.
            </p>

            {/* Featured Image */}
            <div className="mb-8">
              <Image
                src="/nofap-pureresist.jpg"
                alt="Overcome Porn Addiction - Step-by-step recovery plan"
                width={800}
                height={400}
                className="w-full h-auto rounded-2xl"
                priority
              />
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="bg-gray-900 rounded-2xl p-8 mb-8 border border-gray-800">
              <h2 className="text-2xl font-bold mb-4 text-white">Table of Contents</h2>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#understanding-addiction" className="hover:text-accent transition-colors">Understanding Porn Addiction</a></li>
                <li><a href="#step1" className="hover:text-accent transition-colors">Step 1: Acknowledge and Accept</a></li>
                <li><a href="#step2" className="hover:text-accent transition-colors">Step 2: Identify Your Triggers</a></li>
                <li><a href="#step3" className="hover:text-accent transition-colors">Step 3: Build Your Support System</a></li>
                <li><a href="#step4" className="hover:text-accent transition-colors">Step 4: Create Your Recovery Environment</a></li>
                <li><a href="#step5" className="hover:text-accent transition-colors">Step 5: Develop Healthy Coping Mechanisms</a></li>
                <li><a href="#step6" className="hover:text-accent transition-colors">Step 6: Track Progress and Celebrate Wins</a></li>
                <li><a href="#relapse-prevention" className="hover:text-accent transition-colors">Relapse Prevention Strategies</a></li>
                <li><a href="#long-term-success" className="hover:text-accent transition-colors">Long-Term Success and Maintenance</a></li>
              </ul>
            </div>

            <section id="understanding-addiction" className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-white">Understanding Porn Addiction</h2>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Porn addiction is a behavioral addiction characterized by compulsive consumption of pornography despite negative consequences. Like other addictions, it hijacks the brain's reward system, creating powerful cravings and making it difficult to stop despite the desire to quit.
              </p>
              
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold mb-3 text-accent">The Science Behind Addiction</h3>
                <p className="text-gray-300 mb-4">
                  Pornography triggers the release of dopamine, creating a powerful reward loop. Over time, the brain becomes desensitized, requiring more extreme content to achieve the same high. This creates a cycle of escalating consumption that can feel impossible to break.
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li>• <strong>Dopamine Overload:</strong> Artificial stimulation of reward pathways</li>
                  <li>• <strong>Desensitization:</strong> Reduced response to natural rewards</li>
                  <li>• <strong>Compulsive Behavior:</strong> Loss of control over consumption</li>
                  <li>• <strong>Negative Consequences:</strong> Impact on relationships and life quality</li>
                </ul>
              </div>
            </section>

            <section id="step1" className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-white">Step 1: Acknowledge and Accept</h2>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                The first step to recovery is honest self-assessment. Many people struggle with denial, minimizing the impact of their pornography use or rationalizing their behavior. True recovery begins with acceptance.
              </p>
              
              <h3 className="text-2xl font-bold mb-4 text-accent">Signs You May Have a Problem</h3>
              <ul className="space-y-2 text-gray-300 mb-6">
                <li>• Spending excessive time viewing pornography</li>
                <li>• Failed attempts to quit or reduce consumption</li>
                <li>• Neglecting responsibilities due to porn use</li>
                <li>• Relationship problems related to pornography</li>
                <li>• Feelings of guilt, shame, or depression</li>
                <li>• Escalating to more extreme content</li>
              </ul>
              
              <h3 className="text-2xl font-bold mb-4 text-accent">The Power of Acceptance</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Acceptance doesn't mean resignation—it means facing reality so you can take action. When you acknowledge the problem, you can begin to address it systematically rather than continuing to struggle in denial.
              </p>
            </section>

            <section id="step2" className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-white">Step 2: Identify Your Triggers</h2>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Triggers are the situations, emotions, or environmental cues that lead to pornography use. Understanding your triggers is crucial for developing effective prevention strategies.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold mb-3 text-accent">Emotional Triggers</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Stress and anxiety</li>
                    <li>• Loneliness or boredom</li>
                    <li>• Depression or sadness</li>
                    <li>• Anger or frustration</li>
                    <li>• Relationship conflicts</li>
                  </ul>
                </div>
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold mb-3 text-accent">Environmental Triggers</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Being alone at home</li>
                    <li>• Late night hours</li>
                    <li>• Certain websites or apps</li>
                    <li>• Social media exposure</li>
                    <li>• Stressful work situations</li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-accent">Creating Your Trigger Map</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Keep a journal for one week, noting when you feel urges to view pornography. Record the time, your emotional state, what you were doing, and what happened before the urge. This will help you identify patterns and develop targeted prevention strategies.
              </p>
            </section>

            <section id="step3" className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-white">Step 3: Build Your Support System</h2>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Recovery is not a solo journey. Having a strong support system can make the difference between success and relapse. Support can come from various sources, each offering different types of help.
              </p>
              
              <h3 className="text-2xl font-bold mb-4 text-accent">Types of Support</h3>
              <div className="space-y-6">
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <h3 className="text-lg font-bold mb-3 text-accent">Professional Support</h3>
                  <p className="text-gray-300 text-sm">
                    Therapists, counselors, or addiction specialists can provide expert guidance, help you understand underlying issues, and develop personalized recovery strategies.
                  </p>
                </div>
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <h3 className="text-lg font-bold mb-3 text-accent">Peer Support</h3>
                  <p className="text-gray-300 text-sm">
                    Online communities, support groups, or accountability partners who understand your struggle and can offer encouragement and practical advice.
                  </p>
                </div>
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <h3 className="text-lg font-bold mb-3 text-accent">Personal Support</h3>
                  <p className="text-gray-300 text-sm">
                    Trusted friends or family members who can provide emotional support, accountability, and help you stay on track with your recovery goals.
                  </p>
                </div>
              </div>
            </section>

            <section id="step4" className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-white">Step 4: Create Your Recovery Environment</h2>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Your environment plays a crucial role in your recovery success. By removing triggers and creating a supportive physical and digital space, you can significantly reduce the likelihood of relapse.
              </p>
              
              <h3 className="text-2xl font-bold mb-4 text-accent">Digital Environment Changes</h3>
              <ul className="space-y-2 text-gray-300 mb-6">
                <li>• Install website blockers and content filters</li>
                <li>• Remove saved bookmarks and browsing history</li>
                <li>• Use apps that limit screen time and track usage</li>
                <li>• Consider using a basic phone during recovery</li>
                <li>• Set up accountability software that reports to a trusted person</li>
              </ul>
              
              <h3 className="text-2xl font-bold mb-4 text-accent">Physical Environment Changes</h3>
              <ul className="space-y-2 text-gray-300 mb-6">
                <li>• Move your computer to a public area</li>
                <li>• Avoid using devices in private spaces</li>
                <li>• Create a bedtime routine that doesn't involve screens</li>
                <li>• Remove any physical triggers from your environment</li>
                <li>• Set up your space to support healthy activities</li>
              </ul>
            </section>

            <section id="step5" className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-white">Step 5: Develop Healthy Coping Mechanisms</h2>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Pornography often serves as a coping mechanism for stress, boredom, or emotional discomfort. To successfully quit, you need to replace it with healthier alternatives that address the underlying needs.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold mb-3 text-accent">Physical Activities</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Exercise and sports</li>
                    <li>• Walking or hiking</li>
                    <li>• Yoga or meditation</li>
                    <li>• Cold showers</li>
                    <li>• Deep breathing exercises</li>
                  </ul>
                </div>
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold mb-3 text-accent">Mental Activities</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Reading books</li>
                    <li>• Learning new skills</li>
                    <li>• Creative hobbies</li>
                    <li>• Puzzles or games</li>
                    <li>• Journaling or writing</li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-accent">The Urge Surfing Technique</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                When urges arise, instead of fighting them, practice "urge surfing." Observe the urge without acting on it, recognizing that it will peak and then subside. This mindfulness technique can help you ride out difficult moments without giving in.
              </p>
            </section>

            <section id="step6" className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-white">Step 6: Track Progress and Celebrate Wins</h2>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Recovery is a journey, not a destination. Tracking your progress helps you stay motivated and recognize the positive changes you're making. Every day of abstinence is a victory worth celebrating.
              </p>
              
              <h3 className="text-2xl font-bold mb-4 text-accent">Progress Tracking Methods</h3>
              <ul className="space-y-2 text-gray-300 mb-6">
                <li>• Use apps like PureResist to track your streak</li>
                <li>• Keep a recovery journal</li>
                <li>• Mark milestones on a calendar</li>
                <li>• Share progress with your support system</li>
                <li>• Reflect on improvements in your life</li>
              </ul>
              
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold mb-3 text-accent">Celebrating Milestones</h3>
                <p className="text-gray-300 mb-4">
                  Acknowledge and celebrate your achievements, no matter how small:
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li>• <strong>1 Day:</strong> First step toward freedom</li>
                  <li>• <strong>1 Week:</strong> Breaking old patterns</li>
                  <li>• <strong>1 Month:</strong> Significant lifestyle change</li>
                  <li>• <strong>3 Months:</strong> Major transformation</li>
                  <li>• <strong>6 Months+:</strong> Sustained recovery</li>
                </ul>
              </div>
            </section>

            <section id="relapse-prevention" className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-white">Relapse Prevention Strategies</h2>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Relapse is a common part of recovery, but it doesn't mean failure. Understanding how to prevent relapse and how to respond when it happens is crucial for long-term success.
              </p>
              
              <h3 className="text-2xl font-bold mb-4 text-accent">Prevention Strategies</h3>
              <ul className="space-y-2 text-gray-300 mb-6">
                <li>• Maintain your support system connections</li>
                <li>• Continue using healthy coping mechanisms</li>
                <li>• Avoid high-risk situations and triggers</li>
                <li>• Practice stress management techniques</li>
                <li>• Stay accountable to yourself and others</li>
              </ul>
              
              <h3 className="text-2xl font-bold mb-4 text-accent">Responding to Relapse</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                If you do relapse, don't beat yourself up. Instead:
              </p>
              <ul className="space-y-2 text-gray-300 mb-6">
                <li>• Acknowledge what happened without judgment</li>
                <li>• Analyze what led to the relapse</li>
                <li>• Learn from the experience</li>
                <li>• Adjust your prevention strategies</li>
                <li>• Get back on track immediately</li>
              </ul>
            </section>

            <section id="long-term-success" className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-white">Long-Term Success and Maintenance</h2>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Recovery is a lifelong process. While the initial phase focuses on breaking the addiction, long-term success requires ongoing maintenance and personal growth.
              </p>
              
              <h3 className="text-2xl font-bold mb-4 text-accent">Maintenance Strategies</h3>
              <ul className="space-y-2 text-gray-300 mb-6">
                <li>• Continue practicing healthy habits</li>
                <li>• Stay connected to your support system</li>
                <li>• Address underlying issues through therapy</li>
                <li>• Develop a strong sense of purpose</li>
                <li>• Build meaningful relationships</li>
              </ul>
              
              <h3 className="text-2xl font-bold mb-4 text-accent">The New Normal</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                As you progress in recovery, you'll find that your new lifestyle becomes your normal. The benefits you experience—better relationships, improved mental health, increased productivity—will become motivation enough to maintain your commitment.
              </p>
            </section>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 text-center">
              <h3 className="text-2xl font-bold mb-4">Start Your Recovery Journey Today</h3>
              <p className="text-gray-300 mb-6">
                Join thousands of others who have successfully overcome porn addiction with PureResist. Get the tools, support, and motivation you need to break free and build a better life.
              </p>
              <Link 
                href="https://apps.apple.com/rs/app/pureresist-quit-porn-now/id6745742828"
                className="inline-flex items-center bg-accent hover:bg-accent-dark text-white px-8 py-3 rounded-lg font-medium transition-colors duration-300"
              >
                Download PureResist App
              </Link>
            </div>
          </div>

          {/* Related Articles */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Link href="/blog/what-is-nofap" className="group">
                <article className="bg-gray-900 rounded-xl p-6 hover:bg-gray-800 transition-all duration-300 border border-gray-800 hover:border-accent/50">
                  <h4 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">
                    What is NoFap? The Complete Guide to Understanding the Global Self-Improvement Movement
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Discover what NoFap really means, its transformative benefits, and how millions are using this movement to overcome addiction and unlock their full potential.
                  </p>
                </article>
              </Link>
              <Link href="/blog/nofap-benefits-science" className="group">
                <article className="bg-gray-900 rounded-xl p-6 hover:bg-gray-800 transition-all duration-300 border border-gray-800 hover:border-accent/50">
                  <h4 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">
                    The Science Behind NoFap: 7 Proven Benefits Backed by Research
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Explore the scientific evidence behind NoFap benefits including improved focus, energy, confidence, and overall well-being.
                  </p>
                </article>
              </Link>
            </div>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
} 