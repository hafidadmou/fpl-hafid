import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'FPL Hafid | تحليل فريقك في Fantasy Premier League',
  description:
    'حلّل فريقك في Fantasy Premier League مع FPL Hafid. أدخل معرّف فريقك واحصل على تحليل شامل لتشكيلتك ولاعبيك.',
  openGraph: {
    title: 'FPL Hafid | تحليل فريقك في Fantasy Premier League',
    description:
      'حلّل فريقك في Fantasy Premier League مع FPL Hafid. أدخل معرّف فريقك واحصل على تحليل شامل لتشكيلتك ولاعبيك.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: 'FPL Hafid',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FPL Hafid | تحليل فريقك في Fantasy Premier League',
    description:
      'حلّل فريقك في Fantasy Premier League مع FPL Hafid. أدخل معرّف فريقك واحصل على تحليل شامل لتشكيلتك ولاعبيك.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
