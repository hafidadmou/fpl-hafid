'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, CalendarRange, Home, UserRound, Wrench, type LucideIcon } from 'lucide-react';
import { MOBILE_NAV } from '@/lib/nav';

const ICONS: Record<string, LucideIcon> = {
  home: Home,
  team: UserRound,
  players: BarChart3,
  tools: Wrench,
  gameweek: CalendarRange,
};

export default function MobileNav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname?.startsWith(href));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/90 px-2 py-2 shadow-[0_-10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {MOBILE_NAV.map((item) => {
          const Icon = ICONS[item.key] || Home;
          const active = isActive(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-bold transition ${
                active ? 'bg-emerald-500/10 text-emerald-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
