import type { Metadata, Viewport } from 'next';
import { Analytics } from "@vercel/analytics/next";
import './globals.css';
import React from 'react';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.pureresist.com'),
  title: 'PureResist - Your #1 Science-Based NoFap App',
  description: 'Take control of your NoFap journey with PureResist. Track progress, get daily motivation, and join a supportive community for self-improvement.',
  keywords: ['nofap', 'PureResist', 'addiction recovery', 'self-improvement', 'habit tracker', 'productivity app'],
  authors: [{ name: 'PureResist Team' }],
  creator: 'PureResist',
  publisher: 'PureResist',
  formatDetection: {
    telephone: false,
  },
  applicationName: 'PureResist',
  appleWebApp: {
    capable: true,
    title: 'PureResist',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    type: 'website',
    siteName: 'PureResist',
    title: 'PureResist - Your All-in-One NoFap Companion',
    description: 'Take control of your NoFap journey with PureResist. Track progress, get daily motivation, and join a supportive community for self-improvement.',
    images: [{
      url: '/og-image.png',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PureResist - Your All-in-One NoFap Companion',
    description: 'Take control of your NoFap journey with PureResist. Track progress, get daily motivation, and join a supportive community for self-improvement.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#3a86ff',
      },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://www.pureresist.com',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#000000' },
  ],
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "PureResist",
  "url": "https://www.pureresist.com",
  "logo": "https://www.pureresist.com/logo.png",
  "sameAs": [
    "https://www.instagram.com/pureresist/",
    "https://www.twitter.com/pureresist/"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="bg-black text-text-primary min-h-screen selection:bg-accent selection:text-white overflow-x-hidden">
        {children}
        <Analytics />
      </body>
    </html>
  );
} 