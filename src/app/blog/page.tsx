import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Blog - PureResist | NoFap Tips, Motivation & Recovery Stories',
  description: 'Discover expert NoFap tips, motivation strategies, and recovery stories. Learn how to overcome addiction and build better habits with PureResist.',
  keywords: ['nofap blog', 'addiction recovery', 'self-improvement tips', 'motivation', 'habit building', 'PureResist blog'],
  openGraph: {
    title: 'Blog - PureResist | NoFap Tips, Motivation & Recovery Stories',
    description: 'Discover expert NoFap tips, motivation strategies, and recovery stories. Learn how to overcome addiction and build better habits with PureResist.',
    type: 'website',
    url: 'https://PureResist.com/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - PureResist | NoFap Tips, Motivation & Recovery Stories',
    description: 'Discover expert NoFap tips, motivation strategies, and recovery stories.',
  },
};

const blogPosts = [
  {
    slug: 'what-is-nofap',
    title: 'What is NoFap? A Complete Guide to Understanding the Movement',
    excerpt: 'Discover what NoFap really means, its benefits, and how it can transform your life. Learn the science behind the movement and practical steps to get started.',
    date: '2024-01-15',
    readTime: '8 min read',
    category: 'Beginner Guide',
    featured: true,
  },
  {
    slug: 'nofap-benefits-science',
    title: 'The Science Behind NoFap: 7 Proven Benefits Backed by Research',
    excerpt: 'Explore the scientific evidence behind NoFap benefits including improved focus, energy, confidence, and overall well-being.',
    date: '2024-01-20',
    readTime: '12 min read',
    category: 'Science',
    featured: false,
  },
  {
    slug: 'overcome-porn-addiction',
    title: 'How to Overcome Porn Addiction: A Step-by-Step Recovery Plan',
    excerpt: 'Learn proven strategies to break free from porn addiction, rebuild your brain, and create lasting positive changes in your life.',
    date: '2024-01-25',
    readTime: '15 min read',
    category: 'Recovery',
    featured: false,
  },
];

export default function BlogPage() {
  return (
    <main className="flex min-h-screen flex-col bg-black">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20 mt-16 flex-grow">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              PureResist Blog
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Expert insights, motivation, and practical tips to help you on your NoFap journey. 
              Discover the science, strategies, and success stories that will transform your life.
            </p>
          </div>

          {/* Featured Post */}
          {blogPosts.filter(post => post.featured).map((post) => (
            <div key={post.slug} className="mb-16">
              <Link href={`/blog/${post.slug}`} className="group">
                <div className="bg-gray-900 rounded-2xl p-8 hover:bg-gray-800 transition-all duration-300 border border-gray-800 hover:border-accent/50">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                    <span className="text-gray-400 text-sm">{post.readTime}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="text-accent font-medium group-hover:translate-x-1 transition-transform">
                      Read More →
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}

          {/* All Posts */}
          <div className="grid gap-8 md:grid-cols-2">
            {blogPosts.filter(post => !post.featured).map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                <article className="bg-gray-900 rounded-xl p-6 hover:bg-gray-800 transition-all duration-300 border border-gray-800 hover:border-accent/50 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-accent/20 text-accent px-2 py-1 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                    <span className="text-gray-400 text-xs">{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="text-accent text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Read More →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* Newsletter Signup */}
          <div className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="text-gray-300 mb-6">
                Get the latest NoFap tips, motivation, and success stories delivered to your inbox.
              </p>
              <Link 
                href="/waitlist"
                className="inline-flex items-center bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
              >
                Join Our Community
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
} 