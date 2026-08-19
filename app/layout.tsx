import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'NEXUS | AI-Powered Urban Traffic & Fleet Management Platform',
  description:
    'Enterprise B2B SaaS platform for municipal traffic engineers and fleet directors. Optimize traffic signal timing live, reduce city gridlock by 38%, and enable emergency green waves with AI.',
  keywords: [
    'Urban Traffic AI',
    'Municipal Traffic Control',
    'Fleet Optimization',
    'Adaptive Traffic Signal',
    'Smart City SaaS',
    'Emergency Transit Green Wave',
  ],
  authors: [{ name: 'NEXUS Systems' }],
  openGraph: {
    title: 'NEXUS - Next-Gen Urban AI Traffic Intelligence',
    description: 'Transform city corridors into real-time adaptive transit grids with sub-second signal optimization.',
    url: 'https://nexus-urban-ai.com',
    siteName: 'NEXUS AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEXUS | AI-Powered Urban Traffic Platform',
    description: 'Empowering municipal traffic engineers with dynamic AI signal prioritization.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NEXUS Urban AI Traffic Engine',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Cloud',
    description:
      'Enterprise B2B SaaS platform for real-time municipal traffic control, signal prioritization, and autonomous fleet routing.',
    offers: {
      '@type': 'Offer',
      price: '399.00',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'NEXUS Systems Inc.',
      url: 'https://nexus-urban-ai.com',
    },
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-[#F8F9FA] text-[#1F2937]">
        <Providers>
          <Navbar />
          <main className="flex-grow pt-24">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
