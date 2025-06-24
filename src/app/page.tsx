import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Statistics from '@/components/Statistics';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import Discord from '@/components/Discord';
import Reddit from '@/components/Reddit';
import BottomCTA from '@/components/BottomCTA';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  const blogPosts = [
    {
      slug: 'what-is-nofap',
      title: 'What is NoFap? A Complete Guide to Understanding the Movement',
      excerpt: 'Discover what NoFap really means, its benefits, and how it can transform your life. Learn the science behind the movement and practical steps to get started.',
      date: '2024-01-15',
      readTime: '8 min read',
      category: 'Beginner Guide',
    },
    {
      slug: 'nofap-benefits-science',
      title: 'The Science Behind NoFap: 7 Proven Benefits Backed by Research',
      excerpt: 'Explore the scientific evidence behind NoFap benefits including improved focus, energy, confidence, and overall well-being.',
      date: '2024-01-20',
      readTime: '12 min read',
      category: 'Science',
    },
    {
      slug: 'overcome-porn-addiction',
      title: 'How to Overcome Porn Addiction: A Step-by-Step Recovery Plan',
      excerpt: 'Learn proven strategies to break free from porn addiction, rebuild your brain, and create lasting positive changes in your life.',
      date: '2024-01-25',
      readTime: '15 min read',
      category: 'Recovery',
    },
  ];
  return (
    <main className="flex min-h-screen flex-col items-center">
      <Navbar />
      <Hero />
      <Statistics />
      <Testimonials />
      <FAQ />
      <Discord />
      <Reddit />
      <BottomCTA />
      {/* Blog Posts Preview Section */}
      <section className="w-full bg-black py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Latest from the Blog</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {blogPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                <article className="bg-gray-900 rounded-xl p-6 hover:bg-gray-800 transition-all duration-300 border border-gray-800 hover:border-accent/50 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-accent/20 text-accent px-2 py-1 rounded-full text-xs font-medium">{post.category}</span>
                      <span className="text-gray-400 text-xs">{post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-3 group-hover:text-accent transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed line-clamp-3">{post.excerpt}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-gray-400 text-xs">{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span className="text-accent text-sm font-medium group-hover:translate-x-1 transition-transform">Read More →</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/blog" className="inline-flex items-center bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300">View All Blog Posts</Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}  