import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { getCoachBySlug } from "@/lib/mockData";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const coach = getCoachBySlug(slug);
  if (!coach) return { title: "Coach not found" };
  const tagline = coach.tagline ?? coach.coachingType;
  return {
    title: `${coach.name} — ${tagline} | Growial`,
    description: coach.bio.slice(0, 160),
    openGraph: {
      title: `${coach.name} — ${tagline}`,
      description: coach.bio.slice(0, 160),
    },
  };
}

function StarRating({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= full ? "text-amber-500" : "text-gray-200"}>
          {i <= full ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

export default async function PublicCoachProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const coach = getCoachBySlug(slug);

  if (!coach) notFound();

  const hasStats =
    coach.rating != null ||
    coach.reviewCount != null ||
    coach.responseTime ||
    coach.location ||
    (coach.languages && coach.languages.length > 0);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Navbar variant="minimal" />

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        {/* Hero: avatar, name, tagline, stats */}
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            <div className="flex shrink-0">
              {coach.avatarUrl ? (
                <Image
                  src={coach.avatarUrl}
                  alt=""
                  width={120}
                  height={120}
                  className="h-24 w-24 rounded-full object-cover ring-2 ring-white shadow-md md:h-28 md:w-28"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl font-semibold text-gray-600 md:h-28 md:w-28 md:text-4xl">
                  {coach.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold tracking-tight text-black md:text-3xl">
                {coach.name}
              </h1>
              <p className="mt-1 text-base font-medium text-gray-600">{coach.coachingType}</p>
              {coach.tagline && (
                <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-base">
                  {coach.tagline}
                </p>
              )}
              {hasStats && (
                <ul className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                  {coach.rating != null && (
                    <li className="flex items-center gap-1.5">
                      <StarRating value={coach.rating} />
                      <span className="font-medium text-black">{coach.rating}</span>
                    </li>
                  )}
                  {coach.reviewCount != null && (
                    <li>
                      <span className="font-medium text-black">{coach.reviewCount}</span> reviews
                    </li>
                  )}
                  {coach.responseTime && <li>{coach.responseTime}</li>}
                  {coach.location && <li>{coach.location}</li>}
                  {coach.memberSince && <li>Member since {coach.memberSince}</li>}
                  {coach.languages && coach.languages.length > 0 && (
                    <li>Languages: {coach.languages.join(", ")}</li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Left column: About, Services, Reviews */}
          <div className="space-y-8">
            {/* About */}
            <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-lg font-semibold tracking-tight text-black">About</h2>
              <p className="mt-4 whitespace-pre-line text-[0.9375rem] leading-relaxed text-gray-700">
                {coach.bio}
              </p>
            </section>

            {/* Services (like Fiverr gigs) */}
            {coach.services && coach.services.length > 0 && (
              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm md:p-8">
                <h2 className="text-lg font-semibold tracking-tight text-black">
                  Coaching & programmes
                </h2>
                <ul className="mt-4 space-y-4">
                  {coach.services.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-medium text-black">{s.title}</h3>
                          {s.delivery && (
                            <p className="mt-0.5 text-xs text-gray-500">{s.delivery}</p>
                          )}
                          <p className="mt-2 text-sm leading-relaxed text-gray-600">
                            {s.description}
                          </p>
                        </div>
                        {s.price && (
                          <p className="mt-2 shrink-0 text-sm font-semibold text-black sm:mt-0">
                            {s.price}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Reviews */}
            {coach.reviews && coach.reviews.length > 0 && (
              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold tracking-tight text-black">Reviews</h2>
                  {coach.rating != null && coach.reviewCount != null && (
                    <span className="flex items-center gap-2 text-sm text-gray-600">
                      <StarRating value={coach.rating} />
                      <span className="font-medium text-black">{coach.reviewCount} reviews</span>
                    </span>
                  )}
                </div>
                <ul className="mt-6 space-y-6">
                  {coach.reviews.map((r) => (
                    <li key={r.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <StarRating value={r.rating} />
                        <span className="text-sm font-medium text-black">{r.author}</span>
                        {r.role && (
                          <span className="text-xs text-gray-500">· {r.role}</span>
                        )}
                        <span className="ml-auto text-xs text-gray-400">{r.date}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-gray-700">&ldquo;{r.text}&rdquo;</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Right column: sticky contact card */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold tracking-tight text-black">
                Work with {coach.name.split(" ")[0]}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Sign in or join Growial to message this coach and get started.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/sign-in"
                  className="flex h-12 items-center justify-center rounded-full bg-black text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  Contact coach
                </Link>
                {coach.website && (
                  <a
                    href={coach.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 items-center justify-center rounded-full border border-gray-200 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Visit website
                  </a>
                )}
                <Link
                  href="/"
                  className="flex h-12 items-center justify-center rounded-full border border-gray-200 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Find more coaches
                </Link>
              </div>
              {hasStats && (
                <dl className="mt-6 space-y-2 border-t border-gray-100 pt-4 text-sm">
                  {coach.responseTime && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Response time</dt>
                      <dd className="font-medium text-black">{coach.responseTime}</dd>
                    </div>
                  )}
                  {coach.location && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Location</dt>
                      <dd className="font-medium text-black">{coach.location}</dd>
                    </div>
                  )}
                  {coach.languages && coach.languages.length > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Languages</dt>
                      <dd className="font-medium text-black">{coach.languages.join(", ")}</dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          </aside>
        </div>

        <p className="mt-12 text-center text-sm text-gray-400">
          Powered by{" "}
          <Link href="/" className="text-gray-600 hover:text-black">
            Growial
          </Link>
          {" "}— find coaches, get invited, grow in one place.
        </p>
      </main>
    </div>
  );
}
