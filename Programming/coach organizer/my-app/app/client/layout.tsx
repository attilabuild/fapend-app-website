import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For clients",
  description:
    "Find a coach, get invited, and access your coaching in one place. Growial — invitation-only client portal.",
};

export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
