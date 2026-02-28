"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Navbar } from "@/components/Navbar";
import { Rocket } from "lucide-react";

const FORMSPREE_URL = "https://formspree.io/f/xeelnzzr";

type ViewMode = "coach" | "client";

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
    type === "left"
      ? "reveal-left"
      : type === "right"
        ? "reveal-right"
        : type === "scale"
          ? "reveal-scale"
          : "reveal";

  return (
    <div ref={ref} className={`${baseClass} ${delay} ${className}`}>
      {children}
    </div>
  );
}

function ItalicChar({ children }: { children: string }) {
  return <span className="font-serif-italic">{children}</span>;
}


function HeroSection({ viewMode }: { viewMode: ViewMode }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const heroSlides = [
    "https://www.popularhustle.com/wp-content/uploads/2025/05/Alex-Hormozi-1.jpg",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=800&fit=crop",
  ];

  const heroTestimonialsBySlide: Record<ViewMode, { name: string; age: number; role: string; quote: string; avatarUrl: string }[]> = {
    client: [
      { name: "Emma", age: 26, role: "Client", quote: "Everything my coach sends is in one link. Tasks, messages, progress — no more digging through emails.", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop" },
      { name: "James", age: 31, role: "Client", quote: "I always know what to do next. The reminders and milestones keep me on track.", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop" },
      { name: "Lily", age: 24, role: "Client", quote: "So much simpler than before. One place for my programme, my tasks, and my coach's messages.", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop" },
    ],
    coach: [
      { name: "David", age: 22, role: "Fitness Trainer", quote: "Growial helped me a lot with my client progress and the organising is so much easier now!", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop" },
      { name: "Sarah", age: 29, role: "Entrepreneur Mentor", quote: "All my clients in one place. Flows, tasks, and messages — I finally stopped juggling spreadsheets.", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop" },
      { name: "Marcus", age: 35, role: "High-Ticket Coach", quote: "The dashboard and client stages save me hours every week. My clients love the portal too.", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop" },
    ],
  };

  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [hasEverTransitioned, setHasEverTransitioned] = useState(false);
  const slideCount = heroSlides.length;

  const goToSlide = useCallback((next: number) => {
    setCurrentSlide((curr) => {
      if (next === curr) return curr;
      setPrevSlide(curr);
      setHasEverTransitioned(true);
      return next;
    });
  }, []);

  useEffect(() => {
    if (prevSlide === null) return;
    const t = setTimeout(() => setPrevSlide(null), 2000);
    return () => clearTimeout(t);
  }, [prevSlide, currentSlide]);

  useEffect(() => {
    const id = setInterval(() => {
      setHasEverTransitioned(true);
      setCurrentSlide((curr) => {
        const next = (curr + 1) % slideCount;
        setPrevSlide(curr);
        return next;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [slideCount]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const res = await fetch(FORMSPREE_URL, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (res.ok) setSubmitted(true);
  };

  const isClient = viewMode === "client";
  const heroTestimonial = heroTestimonialsBySlide[isClient ? "client" : "coach"][currentSlide];

  return (
    <section className="border-b border-black/10 overflow-hidden px-5 pt-10 pb-12 md:px-10 md:pt-16 lg:px-16 lg:pt-[7.5rem] lg:pb-[6.7rem]">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-6">
        <div className="relative z-10 grid gap-12 lg:gap-12">
          <div className="hero-animate hero-delay-1 inline-flex w-fit items-center gap-2 rounded-full bg-[#f2f2f2] px-4 py-2.5 text-base font-medium leading-[1.2]">
            <span><Rocket size={16} /></span>
            <span>{isClient ? "Find coaches. Get invited. Everything in one place." : "Like Fiverr for coaches. Organise everything inside."}</span>
          </div>

          <div className="grid gap-5">
            <h1 className="hero-animate hero-delay-2 text-[2.25rem] font-normal leading-[1.12] tracking-[-0.02em] md:text-[3rem] lg:text-[3.75rem]">
              {isClient ? (
                <>Find a coach. Get <ItalicChar>invited</ItalicChar>. Grow in one place.</>
              ) : (
                <>Like Fiverr for <ItalicChar>coaches</ItalicChar>. Organise everything inside.</>
              )}
            </h1>

            <p className="hero-animate hero-delay-3 max-w-[23rem] text-[1.125rem] tracking-[-0.02em] text-black/40">
              {isClient
                ? "Your coach invites you. You sign in. Tasks, progress, and messages — all in one place."
                : "Find clients on the platform. Invite them, run flows, and manage everything in one place."}
            </p>
          </div>

          <div className="grid gap-9">
            {submitted ? (
              <div className="hero-animate hero-delay-4 inline-grid gap-3">
                <p className="text-base font-medium leading-[1.2]">🎉 You&apos;re on the list!</p>
                <p className="text-base text-black/40">
                  {isClient ? "We&apos;ll reach out when your coach invites you." : "We&apos;ll email you when Growial Coach launches."}
                </p>
              </div>
            ) : (
              <form
                action={FORMSPREE_URL}
                method="POST"
                onSubmit={handleSubmit}
                className="hero-animate hero-delay-4 flex flex-col gap-3 sm:flex-row"
              >
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 min-w-0 flex-1 rounded-full border-0 bg-[#f2f2f2] px-4 pl-[1.125rem] text-base outline-none placeholder:text-black/40 sm:min-w-[15.75rem]"
                />
                <button
                  type="submit"
                  className="btn-primary h-auto whitespace-nowrap rounded-full bg-black px-5 py-4 text-base leading-[1] text-white transition-all hover:opacity-90 active:bg-black/80"
                >
                  {isClient ? "Notify me" : "Join Waitlist"}
                </button>
              </form>
            )}

            <div className="hero-animate hero-delay-5 flex items-center gap-3 rounded-full bg-[#f5f5f5] py-2.5 pl-2.5 pr-4 w-fit">
              <div className="flex shrink-0 -space-x-3" aria-hidden="true">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop"
                  alt=""
                  className="relative z-10 h-9 w-9 rounded-full object-cover "
                />
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
                  alt=""
                  className="relative z-[5] h-9 w-9 rounded-full object-cover "
                />
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop"
                  alt=""
                  className="relative z-0 h-9 w-9 rounded-full object-cover "
                />
              </div>
              <p className="text-sm font-medium tracking-[-0.02em] text-black/80">
                {isClient ? "Clients get one place for tasks & messages" : "Coaches on the waitlist — join them"}
              </p>
            </div>
          </div>
        </div>

        <div className="hero-animate hero-delay-6 relative z-[1] flex flex-col items-end gap-4">
          <div className="relative w-full max-w-[400px] md:max-w-[500px] lg:max-w-[560px]">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-900 shadow-[2px_7px_15px_rgba(0,0,0,0.1),8px_27px_28px_rgba(0,0,0,0.09)]">
              {/* Incoming: slides in from right (no slide on first paint) */}
              <img
                key={currentSlide}
                src={heroSlides[currentSlide]}
                alt="Growial coaching and client journey platform"
                className={`absolute inset-0 h-full w-full object-cover ${hasEverTransitioned ? "hero-slide-in" : ""}`}
              />
              {/* Outgoing: slides out to left (covers until animation ends) */}
              {prevSlide !== null && (
                <img
                  key={`prev-${prevSlide}`}
                  src={heroSlides[prevSlide]}
                  alt=""
                  aria-hidden
                  className="hero-slide-out absolute inset-0 h-full w-full object-cover"
                />
              )}
            </div>

            {/* Slider dots */}
            <div className="mt-4 flex justify-center gap-2" aria-label="Slider navigation">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentSlide ? "w-6 bg-black" : "w-2 bg-black/25 hover:bg-black/40"
                  }`}
                />
              ))}
            </div>

            {/* Testimonial (changes with slide; no avatar — slider shows the person) */}
            <div className="pointer-events-none absolute bottom-6 left-[-40px] z-10 lg:bottom-10 max-w-[300px] lg:max-w-[320px]">
              <div key={currentSlide} className="hero-popup-card pointer-events-auto rounded-2xl border border-black/[0.06] bg-white/95 px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm">
                <p className="text-xs font-medium uppercase tracking-wider text-black/40">
                  {heroTestimonial.role}
                </p>
                <p className="mt-0.5 text-sm font-semibold tracking-[-0.02em] text-black">
                  {heroTestimonial.name}, {heroTestimonial.age}
                </p>
                <blockquote className="mt-3 text-[0.9375rem] leading-[1.5] tracking-[-0.02em] text-black/75">
                  &ldquo;{heroTestimonial.quote}&rdquo;
                </blockquote>
              </div>
            </div>
          </div>
        </div> 
      </div>
    </section>
  );
}

function WhySection({ viewMode }: { viewMode: ViewMode }) {
  const isClient = viewMode === "client";
  const features = isClient ? [
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
        "Your coach's welcome notes, check-ins, and reminders — all in one place. Never miss what they sent.",
    },
  ] : [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      ),
      title: "Same structure, zero missed steps",
      description:
        "Every client follows the same proven flow. No steps forgotten, no clients falling through the cracks.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 1l4 4-4 4" />
          <path d="M3 11V9a4 4 0 014-4h14" />
          <path d="M7 23l-4-4 4-4" />
          <path d="M21 13v2a4 4 0 01-4 4H3" />
        </svg>
      ),
      title: "Email-only automation",
      description:
        "Welcome, reminders, check-ins, and “falling behind” nudges. Simple personalization: {client_name}, {program_name}, {coach_name}.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      title: "Lightweight analytics",
      description:
        "Completion rate per client, average time to finish onboarding, drop-off points, clients inactive for X days.",
    },
  ];

  return (
    <section id="why" className="px-5 py-20 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 lg:flex lg:items-start lg:justify-between lg:gap-16">
          <Reveal type="left">
            <h2 className="mb-4 max-w-xl text-3xl font-normal leading-[1.2] tracking-[-0.01em] md:text-5xl lg:mb-0">
              {isClient ? (
                <>Get <ItalicChar>invited</ItalicChar>. Sign in. Everything in <ItalicChar>one place</ItalicChar>.</>
              ) : (
                <>Not HubSpot. Not Kajabi. <ItalicChar>Fiverr for coaches</ItalicChar> — organise <ItalicChar>everything</ItalicChar> inside.</>
              )}
            </h2>
          </Reveal>
          <Reveal type="right" delay="delay-200">
            <p className="max-w-sm text-lg tracking-[-0.02em] text-gray-400 lg:pt-2">
              {isClient
                ? "Access is by invitation only. Your coach invites you; you sign up or log in to see your portal, tasks, and progress."
                : "No CRM complexity. No sales pipeline clutter. Find clients, invite them, run flows. Takes 10 minutes to set up."}
            </p>
          </Reveal>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature, i) => (
            <Reveal
              key={i}
              delay={`delay-${(i + 1) * 100}`}
              className="h-full"
            >
              <div className="h-full rounded-2xl bg-gray-50 p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-xl font-medium leading-[1.5]">{feature.title}</h3>
                <p className="text-base leading-relaxed tracking-[-0.02em] text-gray-400">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CreativesMarquee({ viewMode }: { viewMode: ViewMode }) {
  const isClient = viewMode === "client";
  const row1 = isClient ? [
    { name: "1:1 clients", img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop" },
    { name: "Program participants", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&h=80&fit=crop" },
    { name: "Mentees", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop" },
    { name: "Coaching clients", img: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=80&h=80&fit=crop" },
    { name: "Fitness program members", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop" },
    { name: "Business mentees", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" },
    { name: "Mindset program clients", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop" },
    { name: "High-ticket clients", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop" },
    { name: "8-week program members", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop" },
    { name: "Online coaching clients", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop" },
  ] : [
    { name: "Solo coaches", img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop" },
    { name: "Business mentors", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&h=80&fit=crop" },
    { name: "Fitness coaches", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop" },
    { name: "Mindset coaches", img: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=80&h=80&fit=crop" },
    { name: "Program creators", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop" },
    { name: "1:1 mentors", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" },
    { name: "Performance coaches", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop" },
    { name: "8–12 week programs", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop" },
    { name: "High-ticket mentors", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop" },
    { name: "Online coaches", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop" },
  ];

  const row2 = isClient ? [
    { name: "Life coaching clients", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" },
    { name: "Career mentees", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop" },
    { name: "Wellness program members", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop" },
    { name: "Executive mentees", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&h=80&fit=crop" },
    { name: "Course participants", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop" },
    { name: "Consulting clients", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop" },
    { name: "Staying on track", img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop" },
    { name: "Invitation access", img: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=80&h=80&fit=crop" },
    { name: "Clean & simple", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop" },
    { name: "Built for you", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop" },
  ] : [
    { name: "Life coaches", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" },
    { name: "Career coaches", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop" },
    { name: "Wellness coaches", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop" },
    { name: "Executive coaches", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&h=80&fit=crop" },
    { name: "Educators", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop" },
    { name: "Course creators", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop" },
    { name: "Consultants", img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop" },
    { name: "Advisors", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop" },
    { name: "Trainers", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" },
    { name: "Built for simplicity", img: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=80&h=80&fit=crop" },
  ];

  const MarqueeRow = ({
    items,
    reverse = false,
  }: {
    items: typeof row1;
    reverse?: boolean;
  }) => (
    <div className="overflow-hidden py-2">
      <div
        className={`flex gap-4 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ width: "max-content" }}
      >
        {[...items, ...items].map((item, i) => (
          <div
            key={i}
            className="flex shrink-0 items-center gap-3 rounded-full bg-white pr-5 pl-1.5 py-1.5 border border-gray-200"
          >
            <img
              src={item.img}
              alt={item.name}
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="whitespace-nowrap text-xl font-medium tracking-[-0.02em] leading-[1.5]">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section id="who" className="py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
        <Reveal>
          <h2 className="mb-12 text-center text-3xl font-normal tracking-[-0.01em] leading-[1.2] md:text-5xl">
            {isClient ? (
              <>For <ItalicChar>clients</ItalicChar> in <ItalicChar>coaching programs</ItalicChar></>
            ) : (
              <>For <ItalicChar>solo coaches</ItalicChar>, <ItalicChar>mentors</ItalicChar> & <ItalicChar>program creators</ItalicChar></>
            )}
          </h2>
        </Reveal>
      </div>
      <MarqueeRow items={row1} />
      <MarqueeRow items={row2} reverse />
    </section>
  );
}

function FeaturesSection({ viewMode }: { viewMode: ViewMode }) {
  const isClientView = viewMode === "client";
  const [activeTab, setActiveTab] = useState<"client" | "coach">(isClientView ? "client" : "coach");

  const clientContent = {
    headline: "Simple for your clients",
    subtitle: "Invite them. They sign in. Clear tasks and progress in one place. They stay on track.",
    items: [
      {
        title: "Invitation-only portal",
        description: "You invite clients from your dashboard. They sign up or log in to access their portal — tasks, progress, and your messages in one place.",
        bg: "bg-gray-100",
        image: "https://picsum.photos/id/1/224/192",
      },
      {
        title: "Clear tasks & milestones",
        description: "They see what to do next, mark tasks complete, and know exactly where they stand in the program.",
        bg: "bg-gray-50",
        image: "https://picsum.photos/id/2/224/192",
      },
      {
        title: "Progress at a glance",
        description: "A simple progress bar and milestone view so clients stay motivated and know how far they’ve come.",
        bg: "bg-[#e8f0e0]",
        image: "https://picsum.photos/id/3/224/192",
      },
      {
        title: "Messages from you",
        description: "Your welcome messages, check-ins, and reminders in one place. They never miss what you sent.",
        bg: "bg-gray-50",
        image: "https://picsum.photos/id/4/224/192",
      },
    ],
  };

  const coachContent = {
    headline: "Built for coaches like you",
    subtitle: "Whether you run 1:1 sessions, programs, or high-ticket mentorship — same structure, zero chaos.",
    items: [
      {
        title: "Fitness Trainer",
        description: "Onboard clients once, assign workouts and check-ins, automate reminders. Keep everyone on program without chasing.",
        bg: "bg-emerald-50",
        image: "https://cdn.prod.website-files.com/6367f8198bef742a30d18cba/63ada711e1893779ba209215_iAvDJ3EkgPAkaiJXdjh5uCnwgzQ2EpHV9_GZCEEIT44.png",
      },
      {
        title: "Entrepreneur Mentor",
        description: "Structured sprints, milestones, and accountability. Welcome sequences and follow-ups so mentees never fall through the cracks.",
        bg: "bg-sky-50",
        image: "https://www.acquisition.com/hubfs/ACQ_Web_Bio-AlexHormozi%202.png",
      },
      {
        title: "Self Improvement Coach",
        description: "Clear steps from intake to completion. Automated nudges and a simple client view so they stay engaged week after week.",
        bg: "bg-amber-50",
        image: "https://cdn.prod.website-files.com/6763f2026861d030c9624848/687eca0a8087252cb63652c7_Ali-Abdaal-img-min.png",
      },
      {
        title: "High Ticket Coach",
        description: "Premium experience without the admin. One dashboard, prebuilt flows, and a client portal that feels personal — not corporate.",
        bg: "bg-violet-50",
        image: "https://navid.me/wp-content/uploads/2025/02/Iman-Gadzhi-img-min.png",
      },
    ],
  };

  const content = (isClientView ? clientContent : (activeTab === "client" ? clientContent : coachContent));

  return (
    <section id="features" className="px-5 py-20 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        {!isClientView && (
          <Reveal delay="delay-200">
            <div className="mx-auto mb-8 flex w-fit rounded-full bg-gray-100 p-1">
              <button
                onClick={() => setActiveTab("client")}
                className={`rounded-full px-8 py-2.5 text-base font-normal tracking-[-0.02em] transition-all duration-300 ${
                  activeTab === "client"
                    ? "bg-white  text-black"
                    : "text-gray-400 hover:text-black"
                }`}
              >
                Client
              </button>
              <button
                onClick={() => setActiveTab("coach")}
                className={`rounded-full px-8 py-2.5 text-base font-normal tracking-[-0.02em] transition-all duration-300 ${
                  activeTab === "coach"
                    ? "bg-white  text-black"
                    : "text-gray-400 hover:text-black"
                }`}
              >
                Coach
              </button>
            </div>
          </Reveal>
        )}

        <Reveal>
          <h2 className="mb-4 text-center text-3xl font-normal leading-[1.2] tracking-[-0.01em] md:text-5xl">
            {content.headline}
          </h2>
          <p className="mx-auto mb-12 max-w-lg text-center text-lg tracking-[-0.02em] text-gray-400">
            {content.subtitle}
          </p>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2">
          {content.items.map((item, i) => (
            <div
              key={`${activeTab}-${i}`}
              className={`${item.bg} tab-content-enter flex min-h-[280px] flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-md lg:min-h-[320px]`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="px-8 pt-8">
                <h3 className="mb-2 text-[1.75rem] font-medium leading-[1.5]">{item.title}</h3>
                <p className="text-lg tracking-[-0.02em] text-gray-400">{item.description}</p>
              </div>
              <div className="mt-auto flex justify-center overflow-hidden rounded-b-2xl pt-6">
                <img
                  src={item.image}
                  alt=""
                  className="card-feature-img h-40 w-48 object-contain object-bottom lg:h-48 lg:w-56"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReserveAndFAQSection({ viewMode }: { viewMode: ViewMode }) {
  const isClient = viewMode === "client";
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    usage: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const res = await fetch(FORMSPREE_URL, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (res.ok) setSubmitted(true);
  };

  const faqs = isClient ? [
    {
      question: "How do I get access to my coaching?",
      answer:
        "Only by invitation. Your coach sends you an invitation from Growial. You sign up or log in, then you see your portal with tasks, progress, and messages.",
    },
    {
      question: "Do I need to create an account?",
      answer:
        "Yes. Access is invitation-only and you need to sign up or log in to see your coaching. One account — tasks, progress, and coach messages all in one place.",
    },
    {
      question: "What will I see in my portal?",
      answer:
        "Your current milestone, tasks to complete, messages from your coach, and a progress bar. Clean, simple, focused. All after you sign in.",
    },
    {
      question: "What happens when I join the waitlist?",
      answer:
        "We'll notify you when Growial is live. If your coach uses Growial, they'll invite you and you'll sign in to access your coaching.",
    },
    {
      question: "Is this for clients in any coaching program?",
      answer:
        "Yes. 1:1 coaching, 8–12 week programs, high-ticket mentorship — if your coach uses Growial and invites you, you sign in and get everything in one place.",
    },
  ] : [
    {
      question: "Is this for agencies?",
      answer:
        "No. Growial Coach is for solo coaches, mentors, and program creators only. Not for agencies or large teams.",
    },
    {
      question: "How does the client portal work?",
      answer:
        "You invite clients from your dashboard. They receive an invitation and must sign up or log in to access their portal. Then they see their milestone, tasks, your messages, and progress bar. Invitation-only — no anonymous links.",
    },
    {
      question: "Does the MVP handle payments or courses?",
      answer:
        "No. We're not building payments, billing, course hosting, video streaming, or community feeds. This is a client journey automation tool. Assume clients have already paid.",
    },
    {
      question: "Why use this instead of HubSpot?",
      answer:
        "No CRM complexity. No sales pipeline clutter. Built specifically for coaching journeys. Takes 10 minutes to set up. Focused on progress, not leads.",
    },
    {
      question: "What happens after I join the waitlist?",
      answer:
        "You'll get an email confirming you're on the list. We&apos;ll reach out when Growial Coach is ready for beta.",
    },
    {
      question: "Who is this for?",
      answer:
        "Solo coaches, business mentors, fitness coaches (online), mindset and performance coaches, program-based educators (e.g. 8–12 week programs).",
    },
  ];

  return (
    <section id="reserve" className="px-5 py-20 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <h2 className="mb-12 text-center text-3xl font-normal leading-[1.2] tracking-[-0.01em] md:text-5xl lg:text-left">
            {isClient ? (
              <>Get <ItalicChar>invited</ItalicChar> to your coaching</>
            ) : (
              <>Get <ItalicChar>early access</ItalicChar> before we launch</>
            )}
          </h2>
        </Reveal>

        <div className="lg:flex lg:gap-16">
          <div className="hidden lg:block lg:w-1/2">
            <div>
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-gray-100">
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="flex w-full items-center justify-between py-5 text-left"
                  >
                    <span className="pr-4 text-xl tracking-[-0.02em] leading-[1.5]">
                      {faq.question}
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center text-xl text-gray-400">
                      {openIndex === i ? "−" : "+"}
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openIndex === i ? "max-h-60 pb-5" : "max-h-0"
                    }`}
                  >
                    <p className="text-base leading-relaxed tracking-[-0.02em] text-gray-500">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Reveal type="right" delay="delay-200" className="mx-auto max-w-lg lg:mx-0 lg:w-1/2">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 md:p-10">
                {submitted ? (
                  <div className="text-center">
                    <p className="text-base font-medium leading-[1.2]">
                      🎉 You&apos;re on the list!
                    </p>
                    <p className="mt-2 text-base text-gray-500">
                      {isClient ? "We&apos;ll reach out when your coach sends you an invitation." : "We&apos;ll email you when Growial launches."}
                    </p>
                  </div>
                ) : (
                  <form action={FORMSPREE_URL} method="POST" onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="mb-6 text-center text-xl font-medium md:text-2xl">
                      {isClient ? "Notify me when my coach invites me" : "Get early access"}
                    </h3>

                    <div className="flex gap-3">
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First name"
                        required
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        className="h-12 w-full rounded-full border border-gray-200 px-5 text-base outline-none placeholder:text-gray-400 focus:border-gray-400"
                      />
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last name"
                        required
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="h-12 w-full rounded-full border border-gray-200 px-5 text-base outline-none placeholder:text-gray-400 focus:border-gray-400"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="h-12 w-full rounded-full border border-gray-200 px-5 text-base outline-none placeholder:text-gray-400 focus:border-gray-400"
                      />
                      <p className="mt-1.5 px-5 text-xs text-gray-400">
                        {isClient ? "We&apos;ll notify you when your coach sends you an invitation to join." : "We&apos;ll notify you when Growial is ready for beta."}
                      </p>
                    </div>

                    <input type="hidden" name="usage" value={isClient ? "client" : "coach"} />

                    <button
                      type="submit"
                      className="mt-4 h-14 w-full rounded-full bg-black text-base text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {isClient ? "Notify me" : "Join Waitlist"}
                    </button>
                  </form>
                )}
            </div>
          </Reveal>
        </div>

        <div className="mt-12 lg:hidden">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-gray-100">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between py-5 text-left"
              >
                <span className="pr-4 text-xl tracking-[-0.02em] leading-[1.5]">
                  {faq.question}
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center text-xl text-gray-400">
                  {openIndex === i ? "−" : "+"}
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? "max-h-60 pb-5" : "max-h-0"
                }`}
              >
                <p className="text-base leading-relaxed tracking-[-0.02em] text-gray-500">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ viewMode }: { viewMode: ViewMode }) {
  const isClient = viewMode === "client";
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const res = await fetch(FORMSPREE_URL, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (res.ok) setSubmitted(true);
  };

  return (
    <section id="waitlist" className="relative px-5 py-20 md:px-10 lg:px-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=160&h=200&fit=crop"
          alt=""
          className="absolute left-[5%] top-[15%] h-28 w-24 rounded-2xl object-cover opacity-80 animate-float lg:h-36 lg:w-28"
        />
        <img
          src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=200&fit=crop"
          alt=""
          className="absolute right-[5%] top-[10%] h-32 w-24 rounded-2xl object-cover opacity-80 animate-float-delay lg:h-40 lg:w-28"
        />
        <img
          src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&h=200&fit=crop"
          alt=""
          className="absolute bottom-[15%] left-[3%] h-28 w-24 rounded-2xl object-cover opacity-80 animate-float-delay lg:h-36 lg:w-28"
        />
        <img
          src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&h=200&fit=crop"
          alt=""
          className="absolute bottom-[10%] right-[3%] h-28 w-24 rounded-2xl object-cover opacity-80 animate-float lg:h-36 lg:w-28"
        />
      </div>

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
            {isClient ? (
              <>Ready to <ItalicChar>stay on track</ItalicChar>?</>
            ) : (
              <>Ready to stop <ItalicChar>chasing clients</ItalicChar>?</>
            )}
          </h2>
        </Reveal>
        <Reveal delay="delay-200">
          <p className="mb-8 text-lg tracking-[-0.02em] text-gray-400">
            {isClient ? "Get invited by your coach, sign in, and see your progress — all in one place." : "Get early access. Find clients. Organise everything inside."}
          </p>
        </Reveal>

        {submitted ? (
          <div className="mx-auto max-w-md rounded-2xl bg-gray-50 p-6">
            <p className="text-lg font-medium">🎉 You&apos;re on the list!</p>
            <p className="mt-1 text-sm text-gray-500">
              {isClient ? "We&apos;ll reach out when your coach invites you." : "We&apos;ll email you when Growial Coach launches."}
            </p>
          </div>
        ) : (
          <form
            action={FORMSPREE_URL}
            method="POST"
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 flex-1 rounded-full bg-gray-100 px-5 text-base outline-none placeholder:text-gray-400 focus:ring-1 focus:ring-gray-300"
            />
            <button
              type="submit"
              className="h-12 whitespace-nowrap rounded-full bg-black px-6 text-base text-white transition-all hover:opacity-90 active:scale-[0.98]"
            >
              {isClient ? "Notify me" : "Join Waitlist"}
            </button>
          </form>
        )}

        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500">
            <span className="font-medium text-black">{isClient ? "Clients" : "Coaches"}</span>{" "}
            {isClient ? "using their portal" : "joining the waitlist"}
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer({ viewMode }: { viewMode: ViewMode }) {
  const isClient = viewMode === "client";
  const currentYear = new Date().getFullYear();

  const footerLink = "text-sm text-gray-500 hover:text-black transition-colors";
  const footerHeading = "text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4";

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <Reveal className="mx-auto max-w-7xl px-5 py-12 md:px-10 lg:px-16">
        {/* Main footer grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <Logo size={32} />
              <span className="text-lg font-medium tracking-tight text-black">Growial</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">
              {isClient
                ? "Find coaches, get invited, and access your coaching in one place. Built for clients."
                : "Like Fiverr for coaches. Find clients, invite them, organise everything inside. Not for agencies."}
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:text-black"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:text-black"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
          </a>
          <a
                href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:text-black"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className={footerHeading}>Product</h4>
            <nav className="flex flex-col gap-3">
              <a href="#why" className={footerLink}>Why Growial</a>
              <a href="#who" className={footerLink}>Who it&apos;s for</a>
              <a href="#features" className={footerLink}>Features</a>
              <a href="#waitlist" className={footerLink}>Join waitlist</a>
              <a href="/sign-in" className={footerLink}>Sign in</a>
              <a href="/sign-up" className={footerLink}>Sign up</a>
            </nav>
          </div>

          {/* Company */}
          <div>
            <h4 className={footerHeading}>Company</h4>
            <nav className="flex flex-col gap-3">
              <a href="/coach/alex-morgan" className={footerLink}>For coaches</a>
              <a href="#waitlist" className={footerLink}>Early access</a>
              <a href="mailto:hello@Growial.app" className={footerLink}>Contact</a>
            </nav>
          </div>

          {/* Legal & contact */}
          <div>
            <h4 className={footerHeading}>Legal</h4>
            <nav className="flex flex-col gap-3">
              <a href="/privacy" className={footerLink}>Privacy policy</a>
              <a href="/terms" className={footerLink}>Terms of service</a>
            </nav>
            <p className="mt-4 text-sm text-gray-500">
              <a href="mailto:hello@Growial.app" className="hover:text-black transition-colors">hello@Growial.app</a>
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 sm:flex-row">
          <p className="text-sm text-gray-500">
            © {currentYear} Growial. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Like Fiverr for coaches. Organise everything inside. Not for agencies.
          </p>
        </div>
      </Reveal>
    </footer>
  );
}

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("coach");

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="home" viewMode={viewMode} setViewMode={setViewMode} />
      <HeroSection viewMode={viewMode} />
      <WhySection viewMode={viewMode} />
      <CreativesMarquee viewMode={viewMode} />
      <FeaturesSection viewMode={viewMode} />
      <ReserveAndFAQSection viewMode={viewMode} />
      <FinalCTA viewMode={viewMode} />
      <Footer viewMode={viewMode} />
    </div>
  );
}
