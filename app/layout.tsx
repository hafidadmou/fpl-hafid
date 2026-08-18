import './globals.css';
import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import MobileNav from '@/components/MobileNav';

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SITE_NAME = 'FPL Hafid';
const DEFAULT_DESCRIPTION =
  'FPL Hafid منصتك العربية المتكاملة لـ Fantasy Premier League: حلّل فريقك، قارن اللاعبين، تابع المباريات، واستخدم أدوات FPL الذكية قبل كل Gameweek.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | منصتك الذكية لإدارة فريقك في الفانتازي`, template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  keywords: ['FPL', 'Fantasy Premier League', 'فانتازي الدوري الإنجليزي', 'تحليل فريق FPL', 'FPL Hafid'],
  openGraph: {
    title: `${SITE_NAME} | منصتك الذكية لإدارة فريقك في الفانتازي`,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'ar_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | منصتك الذكية لإدارة فريقك في الفانتازي`,
    description: DEFAULT_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className="rtl min-h-screen bg-slate-950 text-white">
        <SiteHeader />
        <div className="pb-24 lg:pb-0">{children}</div>
        <SiteFooter />
        <MobileNav />
      </body>
    </html>
  );
}
