import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12 bg-[#fafafa]">
      <Navbar variant="logoOnly" />

      <div className="w-full max-w-md text-center">
        <p className="text-6xl font-normal tracking-tight text-gray-200 md:text-8xl">
          404
        </p>
        <h1 className="mt-4 text-2xl font-normal tracking-[-0.02em] text-black md:text-3xl">
          Page not found
        </h1>
        <p className="mt-3 text-base text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-black px-8 text-base font-medium text-white transition-colors hover:opacity-90"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
