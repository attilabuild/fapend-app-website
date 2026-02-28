import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Navbar } from "@/components/Navbar";
import { getCoaches } from "@/lib/mockData";
import { CoachBrowse } from "@/components/CoachBrowse";

export default async function BrowsePage() {
  const coaches = getCoaches();

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Navbar variant="browse" />

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-black md:text-3xl">
            Browse coaches
          </h1>
          <p className="mt-2 text-gray-600">
            Find the right coach for you. View profiles, reviews, and programmes.
          </p>
        </div>

        <CoachBrowse coaches={coaches} />

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
