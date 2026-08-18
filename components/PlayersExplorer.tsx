'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Club, PlayerPosition, PlayerRow } from '@/types/platform';
import PlayerCard from './PlayerCard';

type SortKey = 'total_points' | 'form' | 'selected_by_percent' | 'now_cost' | 'minutes' | 'goals_scored' | 'assists' | 'clean_sheets';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'total_points', label: 'النقاط' },
  { key: 'form', label: 'الفورمة' },
  { key: 'selected_by_percent', label: 'نسبة الامتلاك' },
  { key: 'now_cost', label: 'السعر' },
  { key: 'minutes', label: 'الدقائق' },
  { key: 'goals_scored', label: 'الأهداف' },
  { key: 'assists', label: 'التمريرات الحاسمة' },
  { key: 'clean_sheets', label: 'الشباك النظيفة' },
];

const POSITIONS: { key: PlayerPosition | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'كل المراكز' },
  { key: 'GK', label: 'حراس المرمى' },
  { key: 'DEF', label: 'المدافعون' },
  { key: 'MID', label: 'لاعبو الوسط' },
  { key: 'FWD', label: 'المهاجمون' },
];

const PRICE_CEILINGS = [
  { value: 0, label: 'كل الأسعار' },
  { value: 50, label: 'حتى £5.0' },
  { value: 70, label: 'حتى £7.0' },
  { value: 90, label: 'حتى £9.0' },
  { value: 130, label: 'حتى £13.0' },
];

const PAGE_SIZE = 30;

export default function PlayersExplorer({ players, clubs }: { players: PlayerRow[]; clubs: Club[] }) {
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState<PlayerPosition | 'ALL'>('ALL');
  const [club, setClub] = useState<number | 'ALL'>('ALL');
  const [priceCeiling, setPriceCeiling] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('total_points');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return players
      .filter((player) => (position === 'ALL' ? true : player.position === position))
      .filter((player) => (club === 'ALL' ? true : player.team === club))
      .filter((player) => (priceCeiling ? player.now_cost <= priceCeiling : true))
      .filter((player) =>
        query
          ? player.web_name.toLowerCase().includes(query) ||
            `${player.first_name} ${player.second_name}`.toLowerCase().includes(query) ||
            player.team_name.toLowerCase().includes(query)
          : true,
      )
      .sort((a, b) => Number(b[sortKey] ?? 0) - Number(a[sortKey] ?? 0));
  }, [players, search, position, club, priceCeiling, sortKey]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div>
      <div className="mb-6 grid gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="ابحث عن لاعب أو نادٍ..."
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-2.5 pl-3 pr-9 text-sm text-white outline-none transition focus:border-emerald-400/80"
          />
        </div>

        <select
          value={position}
          onChange={(event) => {
            setPosition(event.target.value as PlayerPosition | 'ALL');
            setVisibleCount(PAGE_SIZE);
          }}
          className="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-sm text-white outline-none"
        >
          {POSITIONS.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={club}
          onChange={(event) => {
            setClub(event.target.value === 'ALL' ? 'ALL' : Number(event.target.value));
            setVisibleCount(PAGE_SIZE);
          }}
          className="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-sm text-white outline-none"
        >
          <option value="ALL">كل الأندية</option>
          {clubs.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={priceCeiling}
          onChange={(event) => {
            setPriceCeiling(Number(event.target.value));
            setVisibleCount(PAGE_SIZE);
          }}
          className="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-sm text-white outline-none"
        >
          {PRICE_CEILINGS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={sortKey}
          onChange={(event) => setSortKey(event.target.value as SortKey)}
          className="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-sm text-white outline-none"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.key} value={option.key}>
              ترتيب حسب: {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
        <span>{filtered.length} لاعب</span>
      </div>

      {visible.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((player, index) => (
            <PlayerCard key={player.id} player={player} rank={index + 1} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-8 text-center text-slate-400">
          لا توجد نتائج مطابقة لبحثك. جرّب تعديل الفلاتر.
        </div>
      )}

      {visibleCount < filtered.length && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-bold text-emerald-200 transition hover:bg-emerald-500/20"
          >
            عرض المزيد
          </button>
        </div>
      )}
    </div>
  );
}
