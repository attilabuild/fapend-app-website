"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

type AccountType = "client" | "coach";

export default function SignUpPage() {
  const [accountType, setAccountType] = useState<AccountType>("coach");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to your auth — accountType is "client" | "coach"
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12 bg-[#fafafa]">
      <Navbar variant="logoOnly" />

      <div className="w-full max-w-[400px]">
        <h1 className="text-center text-3xl font-normal tracking-[-0.01em] md:text-4xl">
          Sign up
        </h1>
        <p className="mt-2 text-center text-gray-500">
          Create an account to get started.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am a
            </label>
            <div className="flex rounded-full bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setAccountType("client")}
                className={`flex-1 rounded-full py-2.5 text-sm font-medium tracking-[-0.02em] transition-all ${
                  accountType === "client"
                    ? "bg-white text-black "
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => setAccountType("coach")}
                className={`flex-1 rounded-full py-2.5 text-sm font-medium tracking-[-0.02em] transition-all ${
                  accountType === "coach"
                    ? "bg-white text-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Coach
              </button>
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              {accountType === "client"
                ? "You’ll get a portal link from your coach."
                : "You’ll manage clients and flows from the dashboard."}
            </p>
          </div>

          <input type="hidden" name="accountType" value={accountType} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="sr-only">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="h-12 w-full rounded-full border border-gray-200 bg-white px-5 text-base outline-none placeholder:text-gray-400 focus:border-gray-400"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="sr-only">
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="h-12 w-full rounded-full border border-gray-200 bg-white px-5 text-base outline-none placeholder:text-gray-400 focus:border-gray-400"
              />
            </div>
          </div>
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
              autoComplete="new-password"
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
            Create account
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-black underline underline-offset-2 hover:no-underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
