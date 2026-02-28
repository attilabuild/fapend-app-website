import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Growial account. Access your coach dashboard and manage your clients.",
  robots: { index: false, follow: true },
};

export default function SignInLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
