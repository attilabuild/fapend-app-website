import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your Growial account. Start managing client journeys and coaching flows.",
  robots: { index: false, follow: true },
};

export default function SignUpLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
