"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export type NavbarVariant =
  | "home"      // For coaches / For clients toggle, Join waitlist
  | "client"    // Same but "For clients" active
  | "browse"    // Browse active, For coaches, Sign in
  | "minimal"  // Logo, Find coaches, Sign in (coach profile etc.)
  | "logoOnly"; // Just logo link (auth, legal, 404)

export interface NavbarProps {
  variant: NavbarVariant;
  /** For variant="home" only */
  viewMode?: "coach" | "client";
  setViewMode?: (v: "coach" | "client") => void;
  /** Optional: constrain width (e.g. max-w-6xl for browse) */
  containerClassName?: string;
}

export function Navbar({
  variant,
  viewMode = "coach",
  setViewMode,
  containerClassName,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = variant === "home";
  const isClient = variant === "client";
  const isBrowse = variant === "browse";
  const isMinimal = variant === "minimal";
  const isLogoOnly = variant === "logoOnly";

  const wrapperClass =
    variant === "browse" || variant === "minimal"
      ? "sticky top-0 z-20 border-b border-black/10 bg-white"
      : "sticky top-0 z-50 flex items-center justify-between bg-white/90 backdrop-blur-md px-5 py-4 md:px-10 lg:px-16";

  const innerClass =
    isBrowse || isMinimal
      ? `mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6 ${containerClassName ?? ""}`
      : "flex w-full items-center justify-between";

  if (isLogoOnly) {
    return (
      <Link
        href="/"
        className="absolute top-5 flex items-center gap-2 text-black"
      >
        <Logo size={40} />
      </Link>
    );
  }

  return (
    <header className={wrapperClass}>
      <div className={innerClass}>
        <Link href="/" className="flex shrink-0 items-center gap-2 text-black">
          <Logo size={variant === "browse" || variant === "minimal" ? 48 : 64} />
        </Link>

        {/* Center: For coaches / For clients (home + client) */}
        {(isHome || isClient) && (
          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
            <div className="flex w-fit rounded-full bg-gray-100 p-1">
              {isHome && setViewMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => setViewMode("coach")}
                    className={`rounded-full px-4 py-2 text-sm font-medium tracking-[-0.02em] transition-all ${
                      viewMode === "coach" ? "bg-white text-black" : "text-gray-500 hover:text-black"
                    }`}
                  >
                    For coaches
                  </button>
                  <Link
                    href="/client"
                    className="rounded-full px-4 py-2 text-sm font-medium tracking-[-0.02em] transition-all text-gray-500 hover:text-black"
                  >
                    For clients
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/"
                    className="rounded-full px-4 py-2 text-sm font-medium text-gray-500 hover:text-black"
                  >
                    For coaches
                  </Link>
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
                    For clients
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Right: links + CTA */}
        <div className="flex shrink-0 items-center gap-3 md:gap-4">
          {isBrowse && (
            <>
              <Link href="/browse" className="text-sm font-medium text-black">
                Browse
              </Link>
              <Link href="/" className="text-sm font-medium text-gray-600 hover:text-black">
                For coaches
              </Link>
            </>
          )}
          {isMinimal && (
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-black">
              Find coaches
            </Link>
          )}
          {(isHome || isClient) && (
            <>
              <a
                href={isHome ? "#waitlist" : "/#waitlist"}
                className="hidden rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium tracking-[-0.01em] transition-all hover:bg-black/5 sm:inline-block"
              >
                Join waitlist
              </a>
            </>
          )}
          {!isLogoOnly && !isHome && !isClient && (
            <Link
              href="/sign-in"
              className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Sign in
            </Link>
          )}
          {(isHome || isClient) && (
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 items-center justify-center lg:hidden"
              aria-label="Menu"
            >
              {menuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6L18 18M6 18L18 6" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="8" x2="20" y2="8" />
                  <line x1="4" y1="16" x2="20" y2="16" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu (home + client) */}
      {(isHome || isClient) && menuOpen && (
        <div className="absolute left-0 top-full z-50 w-full border-b border-gray-100 bg-white px-5 py-6 lg:hidden">
          <div className="flex rounded-full bg-gray-100 p-1">
            {isHome && setViewMode ? (
              <>
                <button
                  type="button"
                  onClick={() => { setViewMode("coach"); setMenuOpen(false); }}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-medium ${viewMode === "coach" ? "bg-white shadow-sm text-black" : "text-gray-500"}`}
                >
                  For coaches
                </button>
                <Link
                  href="/client"
                  className="flex-1 rounded-full px-4 py-2 text-center text-sm font-medium text-gray-500"
                  onClick={() => setMenuOpen(false)}
                >
                  For clients
                </Link>
              </>
            ) : (
              <>
                <Link href="/" className="flex-1 rounded-full px-4 py-2 text-center text-sm font-medium text-gray-500" onClick={() => setMenuOpen(false)}>
                  For coaches
                </Link>
                <span className="flex-1 rounded-full bg-white px-4 py-2 text-center text-sm font-medium text-black shadow-sm">For clients</span>
              </>
            )}
          </div>
          <div className="mt-4 flex flex-col gap-4">
            <Link href="/sign-in" className="text-lg font-medium" onClick={() => setMenuOpen(false)}>Sign in</Link>
            <Link href="/sign-up" className="text-lg font-medium" onClick={() => setMenuOpen(false)}>Sign up</Link>
          </div>
        </div>
      )}
    </header>
  );
}
