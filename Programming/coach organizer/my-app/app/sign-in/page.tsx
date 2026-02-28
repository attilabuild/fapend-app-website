"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to your auth
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12 bg-[#fafafa]">
      <Navbar variant="logoOnly" />

      <div className="w-full max-w-[400px]">
        <h1 className="text-center text-3xl font-normal tracking-[-0.01em] md:text-4xl">
          Sign in
        </h1>
        <p className="mt-2 text-center text-gray-500">
          Welcome back. Sign in to your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="h-12 w-full rounded-full border border-gray-200 bg-white px-5 text-base outline-none placeholder:text-gray-400 focus:border-gray-400"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="h-12 w-full rounded-full border border-gray-200 bg-white px-5 text-base outline-none placeholder:text-gray-400 focus:border-gray-400"
            />
          </div>
          <button
            type="submit"
            className="mt-6 h-14 w-full rounded-full bg-black text-base font-medium text-white transition-all hover:opacity-90 active:scale-[0.99]"
          >
            Sign in
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium text-black underline underline-offset-2 hover:no-underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
