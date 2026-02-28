import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/constants";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400"],
});

const title = "Growial – Client Journey Automation for Coaches & Clients";
const description =
  "Never manually onboard or chase clients again. Prebuilt coaching flows, automated reminders, and a simple client portal — built for solo coaches and program creators. One link for clients.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: "/assets/logo.jpg",
    apple: "/assets/logo.jpg",
  },
  title: {
    default: title,
    template: "%s | Growial",
  },
  description,
  keywords: [
    "coaching software",
    "client onboarding",
    "coach dashboard",
    "client portal",
    "coaching automation",
    "solo coaches",
    "mentorship platform",
    "coaching flows",
    "client journey",
    "coach client management",
  ],
  authors: [{ name: "Growial", url: SITE_URL }],
  creator: "Growial",
  publisher: "Growial",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Growial",
    title,
    description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Growial – Client journey automation for coaches",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Growial",
      url: SITE_URL,
      description,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Growial",
      description,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-US",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${instrumentSans.variable} ${instrumentSerif.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
