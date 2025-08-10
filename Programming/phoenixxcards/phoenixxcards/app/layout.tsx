import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StructuredData from "./components/StructuredData";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Phoenix Cards - Ignite Your Learning with AI-Powered Flashcards",
    template: "%s | Phoenix Cards"
  },
  description: "Revolutionary flashcard system with AI-powered spaced repetition. Transform your study routine, improve retention by 300%, and achieve mastery faster than ever before. Free to start.",
  keywords: [
    "flashcards",
    "spaced repetition",
    "learning app",
    "study tools",
    "education technology",
    "AI learning",
    "memory improvement",
    "online learning",
    "study app",
    "learning platform",
    "flashcard app",
    "study techniques",
    "academic success",
    "learning optimization"
  ],
  authors: [{ name: "Phoenix Cards Team", url: "https://phoenixcards.com" }],
  creator: "Phoenix Cards",
  publisher: "Phoenix Cards",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://phoenixcards.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://phoenixcards.com',
    siteName: 'Phoenix Cards',
    title: 'Phoenix Cards - Ignite Your Learning with AI-Powered Flashcards',
    description: 'Revolutionary flashcard system with AI-powered spaced repetition. Transform your study routine and achieve mastery faster than ever before.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Phoenix Cards - AI-Powered Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phoenix Cards - Ignite Your Learning with AI-Powered Flashcards',
    description: 'Revolutionary flashcard system with AI-powered spaced repetition. Transform your study routine and achieve mastery faster than ever before.',
    images: ['/og-image.png'],
    creator: '@phoenixcards',
    site: '@phoenixcards',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', type: 'image/svg+xml' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#e63946' },
    ],
  },
  manifest: '/site.webmanifest',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  category: 'education',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#e63946" />
        <meta name="msapplication-TileColor" content="#e63946" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
