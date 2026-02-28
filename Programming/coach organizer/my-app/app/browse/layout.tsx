import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Coaches | Growial",
  description:
    "Find coaches for fitness, business, career, and more. Browse profiles, read reviews, and get started in one place.",
};

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
