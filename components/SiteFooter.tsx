import Link from 'next/link';
import { MAIN_NAV, PRO_NAV_ITEM } from '@/lib/nav';

export default function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-white/10 bg-slate-950/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-3">
            <p className="text-lg font-black text-white">FPL Hafid</p>
            <p className="text-sm leading-7 text-slate-400">منصتك العربية المتكاملة لـ Fantasy Premier League.</p>
            <a
              href="https://instagram.com/Fplhafid"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-200 transition hover:text-emerald-100"
            >
              @Fplhafid
            </a>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold text-slate-300">روابط سريعة</p>
            <ul className="space-y-2 text-sm text-slate-400">
              {MAIN_NAV.map((item) => (
                <li key={item.key}>
                  <Link href={item.href} className="transition hover:text-emerald-200">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={PRO_NAV_ITEM.href} className="transition hover:text-amber-200">
                  {PRO_NAV_ITEM.label}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold text-slate-300">عن المنصة</p>
            <p className="text-xs leading-7 text-slate-500">
              FPL Hafid منصة مستقلة وليست تابعة أو معتمدة من Fantasy Premier League أو Premier League. جميع البيانات مصدرها الواجهة البرمجية الرسمية لـ FPL.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} FPL Hafid. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
