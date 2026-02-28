"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { MockCoach } from "@/lib/mockData";

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

function matchSearch(coach: MockCoach, q: string): boolean {
  if (!q.trim()) return true;
  const lower = q.toLowerCase().trim();
  const searchable = [
    coach.name,
    coach.coachingType,
    coach.tagline ?? "",
    coach.bio,
    coach.location ?? "",
    (coach.languages ?? []).join(" "),
  ].join(" ");
  return searchable.toLowerCase().includes(lower);
}

type SortOption = "rating" | "reviews" | "name" | "newest";

export function CoachBrowse({ coaches }: { coaches: MockCoach[] }) {
  const [search, setSearch] = useState("");
  const [coachingType, setCoachingType] = useState<string>("all");
  const [minRating, setMinRating] = useState<string>("any");
  const [location, setLocation] = useState<string>("all");
  const [language, setLanguage] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("rating");

  const types = useMemo(() => {
    const set = new Set(coaches.map((c) => c.coachingType).filter(Boolean));
    return Array.from(set).sort();
  }, [coaches]);

  const locations = useMemo(() => {
    const set = new Set(coaches.map((c) => c.location).filter(Boolean));
    return Array.from(set).sort();
  }, [coaches]);

  const languages = useMemo(() => {
    const set = new Set(coaches.flatMap((c) => c.languages ?? []));
    return Array.from(set).sort();
  }, [coaches]);

  const filtered = useMemo(() => {
    let result = coaches.filter((coach) => {
      if (!matchSearch(coach, search)) return false;
      if (coachingType !== "all" && coach.coachingType !== coachingType) return false;
      if (minRating !== "any") {
        const min = parseFloat(minRating);
        if (coach.rating == null || coach.rating < min) return false;
      }
      if (location !== "all" && coach.location !== location) return false;
      if (language !== "all") {
        const langs = coach.languages ?? [];
        if (!langs.includes(language)) return false;
      }
      return true;
    });

    const sortBy = sort;
    result = [...result].sort((a, b) => {
      if (sortBy === "rating") {
        const ra = a.rating ?? 0;
        const rb = b.rating ?? 0;
        return rb - ra;
      }
      if (sortBy === "reviews") {
        const ra = a.reviewCount ?? 0;
        const rb = b.reviewCount ?? 0;
        return rb - ra;
      }
      if (sortBy === "name") {
        return (a.name ?? "").localeCompare(b.name ?? "");
      }
      if (sortBy === "newest") {
        const ya = a.memberSince ?? "";
        const yb = b.memberSince ?? "";
        return yb.localeCompare(ya);
      }
      return 0;
    });

    return result;
  }, [coaches, search, coachingType, minRating, location, language, sort]);

  const hasActiveFilters =
    search.trim() !== "" ||
    coachingType !== "all" ||
    minRating !== "any" ||
    location !== "all" ||
    language !== "all";

  const clearAll = () => {
    setSearch("");
    setCoachingType("all");
    setMinRating("any");
    setLocation("all");
    setLanguage("all");
  };

  return (
    <>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label htmlFor="browse-search" className="sr-only">
            Search coaches
          </label>
          <input
            id="browse-search"
            type="search"
            placeholder="Search by name, type, keyword, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-full border border-gray-200 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
            aria-label="Search coaches"
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
              aria-label="Sort by"
            >
              <option value="rating">Rating: high to low</option>
              <option value="reviews">Most reviews</option>
              <option value="name">Name A–Z</option>
              <option value="newest">Newest first</option>
            </select>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Filters
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={coachingType}
              onChange={(e) => setCoachingType(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none"
              aria-label="Coaching type"
            >
              <option value="all">All types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none"
              aria-label="Minimum rating"
            >
              <option value="any">Any rating</option>
              <option value="4">4+ stars</option>
              <option value="4.5">4.5+ stars</option>
              <option value="5">5 stars only</option>
            </select>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none"
              aria-label="Location"
            >
              <option value="all">All locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none"
              aria-label="Language"
            >
              <option value="all">All languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center">
          <p className="text-gray-500">No coaches match your filters.</p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-4 text-sm font-medium text-black underline hover:no-underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-500">
            Showing {filtered.length} coach{filtered.length !== 1 ? "es" : ""}
          </p>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((coach) => (
              <li key={coach.id}>
                <Link
                  href={`/coach/${coach.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-200 hover:border-gray-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
                >
                  <div className="p-5 md:p-6">
                    <div className="flex gap-4">
                      {coach.avatarUrl ? (
                        <Image
                          src={coach.avatarUrl}
                          alt=""
                          width={72}
                          height={72}
                          className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-gray-100 md:h-16 md:w-16"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-gray-100 to-gray-200 text-lg font-semibold text-gray-600 md:h-16 md:w-16">
                          {coach.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h2 className="font-semibold text-gray-900 group-hover:text-black">
                          {coach.name}
                        </h2>
                        <span className="mt-1.5 inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                          {coach.coachingType}
                        </span>
                        {coach.rating != null && (
                          <div className="mt-2.5 flex items-center gap-2 text-sm">
                            <StarRating value={coach.rating} />
                            {coach.reviewCount != null && (
                              <span className="text-gray-500">
                                ({coach.reviewCount})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {coach.tagline && (
                      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-gray-600">
                        {coach.tagline}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      {coach.location && <span>{coach.location}</span>}
                      {coach.responseTime && (
                        <span className="border-l border-gray-200 pl-3">
                          {coach.responseTime}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-3 text-center transition-colors group-hover:bg-gray-100/80 md:px-6">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-black">
                      View profile
                    </span>
                    <span className="ml-1 inline-block text-gray-400 transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
