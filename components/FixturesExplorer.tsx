'use client';

import { useMemo, useState } from 'react';
import type { Club, FixtureRow, GameweekEvent } from '@/types/platform';

const DIFFICULTY_STYLES: Record<number, string> = {
  1: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
  2: 'bg-emerald-500/10 text-emerald-200 border-emerald-400/20',
  3: 'bg-slate-500/20 text-slate-200 border-slate-400/20',
  4: 'bg-rose-500/10 text-rose-200 border-rose-400/20',
  5: 'bg-rose-500/20 text-rose-200 border-rose-400/30',
};

function formatDate(dateText: string) {
  if (!dateText) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(dateText));
  } catch {
    return dateText;
  }
}

export default function FixturesExplorer({
  fixtures,
  clubs,
  events,
}: {
  fixtures: FixtureRow[];
  clubs: Club[];
  events: GameweekEvent[];
}) {
  const defaultEvent = events.find((event) => event.is_current || event.is_next)?.id ?? 'ALL';
  const [club, setClub] = useState<number | 'ALL'>('ALL');
  const [eventId, setEventId] = useState<number | 'ALL'>(defaultEvent);
  const [venue, setVenue] = useState<'ALL' | 'HOME' | 'AWAY'>('ALL');
  const [maxDifficulty, setMaxDifficulty] = useState(5);

  const filtered = useMemo(() => {
    return fixtures.filter((fixture) => {
      if (eventId !== 'ALL' && fixture.event !== eventId) return false;
      if (club !== 'ALL') {
        const isHome = fixture.team_h === club;
        const isAway = fixture.team_a === club;
        if (!isHome && !isAway) return false;
        if (venue === 'HOME' && !isHome) return false;
        if (venue === 'AWAY' && !isAway) return false;
        const difficulty = isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty;
        if (difficulty > maxDifficulty) return false;
      } else {
        const easier = Math.min(fixture.team_h_difficulty, fixture.team_a_difficulty);
        if (easier > maxDifficulty) return false;
      }
      return true;
    });
  }, [fixtures, club, eventId, venue, maxDifficulty]);

  const grouped = useMemo(() => {
    const map = new Map<number, FixtureRow[]>();
    for (const fixture of filtered) {
      const key = fixture.event ?? 0;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(fixture);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  return (
    <div>
      <div className="mb-6 grid gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4 md:grid-cols-4">
        <select
          value={club}
          onChange={(event) => setClub(event.target.value === 'ALL' ? 'ALL' : Number(event.target.value))}
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
          value={eventId}
          onChange={(event) => setEventId(event.target.value === 'ALL' ? 'ALL' : Number(event.target.value))}
          className="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-sm text-white outline-none"
        >
          <option value="ALL">كل الجولات</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>

        <select
          value={venue}
          onChange={(event) => setVenue(event.target.value as 'ALL' | 'HOME' | 'AWAY')}
          disabled={club === 'ALL'}
          className="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-sm text-white outline-none disabled:opacity-40"
        >
          <option value="ALL">أرض وخارج</option>
          <option value="HOME">داخل الديار فقط</option>
          <option value="AWAY">خارج الديار فقط</option>
        </select>

        <select
          value={maxDifficulty}
          onChange={(event) => setMaxDifficulty(Number(event.target.value))}
          className="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-sm text-white outline-none"
        >
          <option value={5}>كل درجات الصعوبة</option>
          <option value={2}>سهلة فقط (FDR ≤ 2)</option>
          <option value={3}>متوسطة وأسهل (FDR ≤ 3)</option>
        </select>
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-8 text-center text-slate-400">
          لا توجد مباريات مطابقة لهذه الفلاتر.
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([eventNum, list]) => (
            <div key={eventNum} className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
              <h3 className="mb-3 text-lg font-black text-white">الجولة {eventNum || '—'}</h3>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((fixture) => (
                  <div key={fixture.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                    <div className="mb-2 text-xs text-slate-500">{formatDate(fixture.kickoff_time)}</div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`flex-1 rounded-xl border px-2 py-1.5 text-center text-sm font-bold ${DIFFICULTY_STYLES[fixture.team_h_difficulty] || DIFFICULTY_STYLES[3]}`}>
                        {fixture.team_h_short}
                      </span>
                      <span className="text-xs text-slate-500">
                        {fixture.finished ? `${fixture.team_h_score} - ${fixture.team_a_score}` : 'vs'}
                      </span>
                      <span className={`flex-1 rounded-xl border px-2 py-1.5 text-center text-sm font-bold ${DIFFICULTY_STYLES[fixture.team_a_difficulty] || DIFFICULTY_STYLES[3]}`}>
                        {fixture.team_a_short}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
