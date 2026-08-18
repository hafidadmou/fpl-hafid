'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { FixtureRow, PlayerRow } from '@/types/platform';
import { COMPARISON_METRICS, buildComparisonInsights } from '@/lib/analysis-tools';
import PositionPill from './PositionPill';

const MAX_PLAYERS = 4;

function nextFixtureFor(player: PlayerRow, fixtures: FixtureRow[]) {
  return fixtures.find((fixture) => !fixture.finished && (fixture.team_h === player.team || fixture.team_a === player.team));
}

export default function ComparePlayers({ players, fixtures }: { players: PlayerRow[]; fixtures: FixtureRow[] }) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');

  const selectedPlayers = selectedIds.map((id) => players.find((player) => player.id === id)).filter(Boolean) as PlayerRow[];

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return players
      .filter((player) => !selectedIds.includes(player.id))
      .filter((player) => player.web_name.toLowerCase().includes(query) || player.team_name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [players, search, selectedIds]);

  const addPlayer = (id: number) => {
    if (selectedIds.length >= MAX_PLAYERS) return;
    setSelectedIds((current) => [...current, id]);
    setSearch('');
  };

  const removePlayer = (id: number) => setSelectedIds((current) => current.filter((item) => item !== id));

  const insights = useMemo(() => buildComparisonInsights(selectedPlayers), [selectedPlayers]);

  return (
    <div>
      <div className="mb-6 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
        <p className="mb-3 text-sm text-slate-400">اختر من لاعبين إلى 4 للمقارنة ({selectedIds.length}/{MAX_PLAYERS})</p>

        {selectedPlayers.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedPlayers.map((player) => (
              <span key={player.id} className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-bold text-emerald-100">
                {player.web_name}
                <button type="button" onClick={() => removePlayer(player.id)} aria-label={`إزالة ${player.web_name}`}>
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        {selectedIds.length < MAX_PLAYERS && (
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث عن لاعب لإضافته للمقارنة..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-2.5 pl-3 pr-9 text-sm text-white outline-none focus:border-emerald-400/80"
            />
            {suggestions.length > 0 && (
              <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-xl">
                {suggestions.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => addPlayer(player.id)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-right text-sm text-slate-200 transition hover:bg-emerald-500/10"
                  >
                    <span>
                      {player.web_name} <span className="text-xs text-slate-500">{player.team_name}</span>
                    </span>
                    <PositionPill position={player.position} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedPlayers.length < 2 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-8 text-center text-slate-400">
          اختر لاعبين على الأقل لبدء المقارنة.
        </div>
      ) : (
        <>
          <div className="mb-6 overflow-x-auto rounded-[1.5rem] border border-white/10 bg-slate-950/60">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="px-4 py-3 text-right font-bold">الإحصائية</th>
                  {selectedPlayers.map((player) => (
                    <th key={player.id} className="px-4 py-3 text-center font-black text-white">
                      {player.web_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_METRICS.map((metric) => {
                  const values = selectedPlayers.map((player) => Number(player[metric.key] ?? 0));
                  const best = metric.higherIsBetter ? Math.max(...values) : Math.min(...values);
                  return (
                    <tr key={String(metric.key)} className="border-b border-white/5">
                      <td className="px-4 py-3 text-slate-400">{metric.label}</td>
                      {selectedPlayers.map((player) => {
                        const value = Number(player[metric.key] ?? 0);
                        const formatted = metric.format ? metric.format(value) : value.toString();
                        const isBest = value === best;
                        return (
                          <td key={player.id} className={`px-4 py-3 text-center font-bold ${isBest ? 'text-emerald-300' : 'text-slate-200'}`}>
                            {formatted}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr>
                  <td className="px-4 py-3 text-slate-400">المباراة القادمة</td>
                  {selectedPlayers.map((player) => {
                    const fixture = nextFixtureFor(player, fixtures);
                    if (!fixture) {
                      return (
                        <td key={player.id} className="px-4 py-3 text-center text-slate-500">
                          —
                        </td>
                      );
                    }
                    const isHome = fixture.team_h === player.team;
                    const opponent = isHome ? fixture.team_a_short : fixture.team_h_short;
                    return (
                      <td key={player.id} className="px-4 py-3 text-center text-slate-200">
                        {opponent} ({isHome ? 'أرض' : 'خارج'})
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {insights.length > 0 && (
            <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/5 p-5">
              <h3 className="mb-3 text-lg font-black text-white">استنتاجات المقارنة</h3>
              <ul className="space-y-2 text-sm leading-7 text-slate-200">
                {insights.map((insight) => (
                  <li key={insight}>• {insight}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-500">هذه الاستنتاجات تحليلية مبنية على البيانات الحالية وليست ضمانًا لأداء مستقبلي.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
