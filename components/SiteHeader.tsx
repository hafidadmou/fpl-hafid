'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Zap } from 'lucide-react';
import { MAIN_NAV, PRO_NAV_ITEM } from '@/lib/nav';

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname?.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-yellow-400/60 bg-slate-950/70 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
            <img src="/images/IMG_6876.png" alt="شعار FPL Hafid" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-base font-black tracking-tight text-white">FPL Hafid</p>
            <p className="text-[10px] text-slate-400">منصة FPL العربية المتكاملة</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`rounded-full px-3 py-2 text-sm font-bold transition ${
                isActive(item.href)
                  ? 'bg-emerald-500/15 text-emerald-200'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={PRO_NAV_ITEM.href}
            className="hidden items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs font-black text-amber-200 transition hover:bg-amber-400/20 sm:inline-flex"
          >
            <Zap size={13} className="fill-current" />
            PRO
          </Link>
          <Link
            href="/team"
            className="hidden rounded-full bg-gradient-to-r from-emerald-400 to-lime-300 px-4 py-2 text-sm font-black text-slate-900 shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02] md:inline-flex"
          >
            حلّل فريقي
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden"
            aria-label="القائمة"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-slate-950/95 px-4 py-4 lg:hidden">
          <div className="grid gap-1">
            {[...MAIN_NAV, PRO_NAV_ITEM].map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                  isActive(item.href) ? 'bg-emerald-500/15 text-emerald-200' : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
