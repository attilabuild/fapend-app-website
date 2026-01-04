import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-6">Page Not Found</h2>
      <p className="mb-8 text-gray-300 text-center max-w-md">Sorry, the page you are looking for does not exist. Here are some helpful links to get you back on track:</p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/" className="bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-dark transition">Home</Link>
        <Link href="/blog" className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition">Blog</Link>
        <Link href="/contact" className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition">Contact</Link>
      </div>
    </main>
  );
} 