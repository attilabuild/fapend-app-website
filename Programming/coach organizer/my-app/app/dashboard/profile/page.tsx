"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_COACH, type MockCoach } from "@/lib/mockData";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Budapest",
  "Asia/Tokyo",
  "Australia/Sydney",
];

function slugFrom(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function CoachProfilePage() {
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<MockCoach>({ ...MOCK_COACH });

  const update = (field: keyof MockCoach, value: string) => {
    setSaved(false);
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
  };

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/coach/${profile.slug}`
      : "";

  const copyPublicUrl = () => {
    if (publicUrl) navigator.clipboard.writeText(publicUrl);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-normal tracking-[-0.01em] md:text-3xl">
          Profile
        </h1>
        <p className="mt-1 text-gray-500">
          Edit your profile. Your public page is what clients see when you share your link.
        </p>
      </div>

      {/* Public profile link */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
        <h2 className="text-lg font-medium">Public profile</h2>
        <p className="mt-1 text-sm text-gray-500">
          Share this link so clients can view your profile.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-xl bg-gray-50 px-4 py-2.5 text-sm text-gray-600">
            /coach/{profile.slug || "your-slug"}
          </span>
          <Link
            href={`/coach/${profile.slug || "alex-morgan"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-black hover:underline"
          >
            View public page →
          </Link>
          {publicUrl && (
            <button
              type="button"
              onClick={copyPublicUrl}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Copy link
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
          <h2 className="text-lg font-medium">Basic info</h2>
          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Profile URL slug
              </label>
              <input
                id="slug"
                type="text"
                value={profile.slug}
                onChange={(e) => update("slug", slugFrom(e.target.value) || e.target.value)}
                placeholder="alex-morgan"
                className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-4 text-base outline-none placeholder:text-gray-400 focus:border-gray-400"
              />
              <p className="mt-1 text-xs text-gray-500">
                Letters, numbers, and hyphens only. Your page: Growial.com/coach/
                <strong>{profile.slug || "your-slug"}</strong>
              </p>
            </div>
            <div className="flex items-start gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gray-100 text-2xl font-medium text-gray-500">
                {profile.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1 space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Display name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={profile.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-4 text-base outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-4 text-base outline-none focus:border-gray-400"
                  />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="coachingType" className="block text-sm font-medium text-gray-700">
                Coaching type
              </label>
              <input
                id="coachingType"
                type="text"
                value={profile.coachingType}
                onChange={(e) => update("coachingType", e.target.value)}
                placeholder="e.g. Business Coach, Fitness Trainer"
                className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-4 text-base outline-none placeholder:text-gray-400 focus:border-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
          <h2 className="text-lg font-medium">Bio</h2>
          <p className="mt-1 text-sm text-gray-500">
            A short description for clients and your public profile.
          </p>
          <textarea
            value={profile.bio}
            onChange={(e) => update("bio", e.target.value)}
            rows={4}
            className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none placeholder:text-gray-400 focus:border-gray-400"
            placeholder="Tell clients about your background and approach..."
          />
        </div>

        {/* Contact & settings */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
          <h2 className="text-lg font-medium">Contact & settings</h2>
          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website (optional)
              </label>
              <input
                id="website"
                type="url"
                value={profile.website ?? ""}
                onChange={(e) => update("website", e.target.value)}
                placeholder="https://..."
                className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-4 text-base outline-none placeholder:text-gray-400 focus:border-gray-400"
              />
            </div>
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                Timezone
              </label>
              <select
                id="timezone"
                value={profile.timezone}
                onChange={(e) => update("timezone", e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-base outline-none focus:border-gray-400"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-500 hover:text-black"
          >
            ← Back to dashboard
          </Link>
          <button
            type="submit"
            className={`h-11 rounded-full px-8 text-sm font-medium transition-all ${
              saved
                ? "bg-emerald-600 text-white"
                : "bg-black text-white hover:opacity-90"
            }`}
          >
            {saved ? "Saved" : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
