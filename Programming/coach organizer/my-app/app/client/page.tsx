"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/Logo";
import { Navbar } from "@/components/Navbar";
import { Rocket } from "lucide-react";

const FORMSPREE_URL = "https://formspree.io/f/xeelnzzr";

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return ref;
}

function Reveal({
  children,
  className = "",
  type = "up",
  delay = "",
}: {
  children: React.ReactNode;
  className?: string;
  type?: "up" | "left" | "right" | "scale";
  delay?: string;
}) {
  const ref = useReveal();
  const baseClass =
    type === "left" ? "reveal-left" : type === "right" ? "reveal-right" : type === "scale" ? "reveal-scale" : "reveal";
  return (
    <div ref={ref} className={`${baseClass} ${delay} ${className}`}>
      {children}
    </div>
  );
}

function ItalicChar({ children }: { children: string }) {
  return <span className="font-serif-italic">{children}</span>;
}

const CLIENT_FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    ),
    title: "Invitation-only access",
    description:
      "Your coach invites you from Growial. You sign up or log in once, then see your tasks, progress, and messages — all in one place.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "Clear what to do next",
    description:
      "See your current milestone, mark tasks complete, and know exactly where you stand. Stay on track without chasing your coach.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    title: "Messages in one place",
    description:
      "All messages from your coach in your portal. No digging through email — just sign in and see what they sent.",
  },
];

const MARQUEE_ROW1 = [
  { name: "1:1 clients", img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop" },
  { name: "Program participants", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&h=80&fit=crop" },
  { name: "Coaching clients", img: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=80&h=80&fit=crop" },
  { name: "Mindset program clients", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop" },
  { name: "8-week program members", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop" },
];

const MARQUEE_ROW2 = [
  { name: "Life coaching clients", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" },
  { name: "Wellness program members", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop" },
  { name: "Invitation access", img: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=80&h=80&fit=crop" },
  { name: "Clean & simple", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop" },
  { name: "Built for you", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop" },
];

const CLIENT_FAQS = [
  { question: "How do I get access to my coaching?", answer: "Only by invitation. Your coach sends you an invitation from Growial. You sign up or log in, then you see your portal with tasks, progress, and messages." },
  { question: "Do I need to create an account?", answer: "Yes. Access is invitation-only and you need to sign up or log in to see your coaching. One account — tasks, progress, and coach messages all in one place." },
  { question: "What will I see in my portal?", answer: "Your current milestone, tasks to complete, messages from your coach, and a progress bar. Clean, simple, focused. All after you sign in." },
  { question: "What happens when I join the waitlist?", answer: "We'll notify you when Growial is live. If your coach uses Growial, they'll invite you and you'll sign in to access your coaching." },
  { question: "Is this for clients in any coaching program?", answer: "Yes. 1:1 coaching, 8–12 week programs, high-ticket mentorship — if your coach uses Growial and invites you, you sign in and get everything in one place." },
];

export default function ClientsPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "" });
  const [reserveSubmitted, setReserveSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleHeroSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const res = await fetch(FORMSPREE_URL, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
    if (res.ok) setSubmitted(true);
  };

  const handleReserveSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const res = await fetch(FORMSPREE_URL, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
    if (res.ok) setReserveSubmitted(true);
  };

  const handleFinalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    await fetch(FORMSPREE_URL, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="client" />

      {/* Hero */}
      <section className="border-b border-black/10 overflow-hidden px-5 pt-10 pb-12 md:px-10 md:pt-16 lg:px-16 lg:pt-24 lg:pb-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-6">
          <div className="relative z-10 grid gap-12">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f2f2f2] px-4 py-2.5 text-base font-medium">
              <Rocket size={16} />
              <span>Find coaches. Get invited. Everything in one place.</span>
            </div>
            <div className="grid gap-5">
              <h1 className="text-[2.25rem] font-normal leading-[1.12] tracking-[-0.02em] md:text-[3rem] lg:text-[3.75rem]">
                Find a coach. Get <ItalicChar>invited</ItalicChar>. Grow in one place.
              </h1>
              <p className="max-w-[23rem] text-[1.125rem] tracking-[-0.02em] text-black/40">
                Your coach invites you. You sign in. Tasks, progress, and messages — all in one place.
              </p>
            </div>
            {submitted ? (
              <div className="inline-grid gap-3">
                <p className="text-base font-medium">🎉 You&apos;re on the list!</p>
                <p className="text-base text-black/40">We&apos;ll reach out when your coach invites you.</p>
              </div>
            ) : (
              <form action={FORMSPREE_URL} method="POST" onSubmit={handleHeroSubmit} className="flex flex-col gap-3 sm:flex-row">
                <input type="hidden" name="usage" value="client" />
                <input type="email" name="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 min-w-0 flex-1 rounded-full border-0 bg-[#f2f2f2] px-4 pl-5 text-base outline-none placeholder:text-black/40 sm:min-w-[15.75rem]" />
                <button type="submit" className="btn-primary h-auto whitespace-nowrap rounded-full bg-black px-5 py-4 text-base text-white transition-all hover:opacity-90 active:bg-black/80">Notify me</button>
              </form>
            )}
            <div className="inline-grid grid-flow-col items-center gap-2 text-base font-medium tracking-[-0.02em]">
              <div className="flex -space-x-3" aria-hidden="true">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop" alt="" className="h-12 w-12 rounded-full border-2 border-white object-cover" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop" alt="" className="h-12 w-12 rounded-full border-2 border-white object-cover" />
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop" alt="" className="h-12 w-12 rounded-full border-2 border-white object-cover" />
              </div>
              <p><span className="text-black">Clients</span> <span className="font-normal text-black/40">using their portal</span></p>
            </div>
          </div>
          <div className="relative z-[1] flex justify-end">
            <div className="relative aspect-square w-full max-w-lg overflow-hidden rounded-2xl bg-gray-100">
              <Image src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=800&fit=crop" alt="Clients in coaching" fill className="object-cover" unoptimized />
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section id="why" className="px-5 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 lg:flex lg:items-start lg:justify-between lg:gap-16">
            <Reveal type="left">
              <h2 className="mb-4 max-w-xl text-3xl font-normal leading-[1.2] tracking-[-0.01em] md:text-5xl lg:mb-0">
                Get <ItalicChar>invited</ItalicChar>. Sign in. Everything in <ItalicChar>one place</ItalicChar>.
              </h2>
            </Reveal>
            <Reveal type="right" delay="delay-200">
              <p className="max-w-sm text-lg tracking-[-0.02em] text-gray-400 lg:pt-2">
                Access is by invitation only. Your coach invites you; you sign up or log in to see your portal, tasks, and progress.
              </p>
            </Reveal>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {CLIENT_FEATURES.map((feature, i) => (
              <Reveal key={i} delay={`delay-${(i + 1) * 100}`} className="h-full">
                <div className="h-full rounded-2xl bg-gray-50 p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm">{feature.icon}</div>
                  <h3 className="mb-3 text-xl font-medium leading-[1.5]">{feature.title}</h3>
                  <p className="text-base leading-relaxed tracking-[-0.02em] text-gray-400">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Who */}
      <section id="who" className="py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <Reveal>
            <h2 className="mb-12 text-center text-3xl font-normal tracking-[-0.01em] leading-[1.2] md:text-5xl">
              For <ItalicChar>clients</ItalicChar> in <ItalicChar>coaching programs</ItalicChar>
            </h2>
          </Reveal>
        </div>
        <div className="overflow-hidden">
          <div className="flex animate-marquee gap-4 py-4">
            {[...MARQUEE_ROW1, ...MARQUEE_ROW1].map((item, i) => (
              <div key={i} className="flex shrink-0 items-center gap-3 rounded-full border border-gray-200 bg-white pr-5 pl-1.5 py-1.5">
                <img src={item.img} alt="" className="h-10 w-10 rounded-full object-cover" width={40} height={40} />
                <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
              </div>
            ))}
            {[...MARQUEE_ROW2, ...MARQUEE_ROW2].map((item, i) => (
              <div key={`r2-${i}`} className="flex shrink-0 items-center gap-3 rounded-full border border-gray-200 bg-white pr-5 pl-1.5 py-1.5">
                <img src={item.img} alt="" className="h-10 w-10 rounded-full object-cover" width={40} height={40} />
                <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reserve + FAQ */}
      <section id="waitlist" className="px-5 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <h2 className="mb-12 text-center text-3xl font-normal leading-[1.2] tracking-[-0.01em] md:text-5xl lg:text-left">
              Get <ItalicChar>invited</ItalicChar> to your coaching
            </h2>
          </Reveal>
          <div className="lg:flex lg:gap-16">
            <div className="hidden lg:block lg:w-1/2">
              {CLIENT_FAQS.map((faq, i) => (
                <div key={i} className="border-b border-gray-100">
                  <button onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)} className="flex w-full items-center justify-between py-5 text-left">
                    <span className="pr-4 text-xl tracking-[-0.02em] leading-[1.5]">{faq.question}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center text-xl text-gray-400">{openFaqIndex === i ? "−" : "+"}</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaqIndex === i ? "max-h-60 pb-5" : "max-h-0"}`}>
                    <p className="text-base leading-relaxed tracking-[-0.02em] text-gray-500">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
            <Reveal type="right" delay="delay-200" className="mx-auto max-w-lg lg:w-1/2">
              <div className="rounded-3xl border border-gray-200 bg-white p-8 md:p-10">
                {reserveSubmitted ? (
                  <div className="text-center">
                    <p className="text-base font-medium">🎉 You&apos;re on the list!</p>
                    <p className="mt-2 text-base text-gray-500">We&apos;ll reach out when your coach sends you an invitation.</p>
                  </div>
                ) : (
                  <form action={FORMSPREE_URL} method="POST" onSubmit={handleReserveSubmit} className="space-y-4">
                    <input type="hidden" name="usage" value="client" />
                    <h3 className="mb-6 text-center text-xl font-medium md:text-2xl">Notify me when my coach invites me</h3>
                    <div className="flex gap-3">
                      <input type="text" name="firstName" placeholder="First name" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="h-12 w-full rounded-full border border-gray-200 px-5 text-base outline-none focus:border-gray-400" />
                      <input type="text" name="lastName" placeholder="Last name" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="h-12 w-full rounded-full border border-gray-200 px-5 text-base outline-none focus:border-gray-400" />
                    </div>
                    <div>
                      <input type="email" name="email" placeholder="Enter your email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-12 w-full rounded-full border border-gray-200 px-5 text-base outline-none focus:border-gray-400" />
                      <p className="mt-1.5 px-5 text-xs text-gray-400">We&apos;ll notify you when your coach sends you an invitation to join.</p>
                    </div>
                    <button type="submit" className="mt-4 h-14 w-full rounded-full bg-black text-base text-white transition-transform hover:scale-[1.01] active:scale-[0.99]">Notify me</button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-gray-100 px-5 py-24 md:px-10 lg:px-16">
        <div className="relative mx-auto max-w-2xl text-center">
          <Reveal type="scale">
            <div className="mb-6 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <Logo size={32} />
              </div>
            </div>
          </Reveal>
          <Reveal delay="delay-100">
            <h2 className="mb-4 text-3xl font-normal leading-[1.2] tracking-[-0.01em] md:text-5xl">
              Ready to <ItalicChar>stay on track</ItalicChar>?
            </h2>
          </Reveal>
          <Reveal delay="delay-200">
            <p className="mb-8 text-lg tracking-[-0.02em] text-gray-400">
              Get invited by your coach, sign in, and see your progress — all in one place.
            </p>
          </Reveal>
          {submitted ? (
            <div className="mx-auto max-w-md rounded-2xl bg-gray-50 p-6">
              <p className="text-lg font-medium">🎉 You&apos;re on the list!</p>
              <p className="mt-1 text-sm text-gray-500">We&apos;ll reach out when your coach invites you.</p>
            </div>
          ) : (
            <form action={FORMSPREE_URL} method="POST" onSubmit={handleFinalSubmit} className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
              <input type="hidden" name="usage" value="client" />
              <input type="email" name="email" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 flex-1 rounded-full bg-gray-100 px-5 text-base outline-none focus:ring-1 focus:ring-gray-300" />
              <button type="submit" className="h-12 whitespace-nowrap rounded-full bg-black px-6 text-base text-white transition-all hover:opacity-90 active:scale-[0.98]">Notify me</button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-10 lg:px-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="sm:col-span-2 lg:col-span-2">
              <Link href="/" className="inline-flex items-center gap-2">
                <Logo size={32} />
                <span className="text-lg font-medium tracking-tight text-black">Growial</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">
                Find coaches, get invited, and access your coaching in one place. Built for clients.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Product</h4>
              <nav className="flex flex-col gap-3">
                <Link href="#why" className="text-sm text-gray-500 hover:text-black">Why Growial</Link>
                <Link href="#who" className="text-sm text-gray-500 hover:text-black">Who it&apos;s for</Link>
                <Link href="#waitlist" className="text-sm text-gray-500 hover:text-black">Join waitlist</Link>
                <Link href="/sign-in" className="text-sm text-gray-500 hover:text-black">Sign in</Link>
                <Link href="/sign-up" className="text-sm text-gray-500 hover:text-black">Sign up</Link>
              </nav>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Legal</h4>
              <nav className="flex flex-col gap-3">
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-black">Privacy policy</Link>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-black">Terms of service</Link>
              </nav>
              <p className="mt-4 text-sm text-gray-500">
                <a href="mailto:hello@Growial.app" className="hover:text-black">hello@Growial.app</a>
              </p>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 sm:flex-row">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} Growial. All rights reserved.</p>
            <p className="text-sm text-gray-500">Like Fiverr for coaches. Organise everything inside. Not for agencies.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
