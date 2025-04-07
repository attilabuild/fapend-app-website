import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fapend - Your All-in-One NoFap Companion',
  description: 'Take control of your NoFap journey with Fapend. Track progress, get daily motivation, and join a supportive community for self-improvement.',
  keywords: ['nofap', 'fapend', 'addiction recovery', 'self-improvement', 'habit tracker', 'productivity app'],
  authors: [{ name: 'Fapend Team' }],
  creator: 'Fapend',
  publisher: 'Fapend',
  formatDetection: {
    telephone: false,
  },
  applicationName: 'Fapend',
  appleWebApp: {
    capable: true,
    title: 'Fapend',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    type: 'website',
    siteName: 'Fapend',
    title: 'Fapend - Your All-in-One NoFap Companion',
    description: 'Take control of your NoFap journey with Fapend. Track progress, get daily motivation, and join a supportive community for self-improvement.',
    images: [{
      url: '/og-image.png',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fapend - Your All-in-One NoFap Companion',
    description: 'Take control of your NoFap journey with Fapend. Track progress, get daily motivation, and join a supportive community for self-improvement.',
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
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-text-primary min-h-screen selection:bg-accent selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
} 