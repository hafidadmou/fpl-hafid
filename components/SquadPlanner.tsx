'use client';

import { useMemo, useState } from 'react';
import { Crown, Search, ShieldHalf, Trash2 } from 'lucide-react';
import type { PlayerPosition, PlayerRow } from '@/types/platform';
import { canAddPlayerToSquad, SQUAD_RULES, VALID_FORMATIONS } from '@/lib/analysis-tools';
import { formatPrice } from '@/lib/fpl-data';
import PositionPill from './PositionPill';

const POSITION_ORDER: PlayerPosition[] = ['GK', 'DEF', 'MID', 'FWD'];

export default function SquadPlanner({ players }: { players: PlayerRow[] }) {
  const [squad, setSquad] = useState<PlayerRow[]>([]);
  const [formationKey, setFormationKey] = useState(VALID_FORMATIONS[2].key);
  const [captainId, setCaptainId] = useState<number | null>(null);
  const [viceId, setViceId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const spent = squad.reduce((sum, player) => sum + player.now_cost, 0);
  const budgetRemaining = SQUAD_RULES.budget - spent;
  const formation = VALID_FORMATIONS.find((f) => f.key === formationKey) || VALID_FORMATIONS[2];

  const startingXI = useMemo(() => {
    const result: PlayerRow[] = [];
    for (const position of POSITION_ORDER) {
      const need = formation[position];
      const pool = squad.filter((player) => player.position === position).sort((a, b) => b.total_points - a.total_points);
      result.push(...pool.slice(0, need));
    }
    return result;
  }, [squad, formation]);

  const bench = squad.filter((player) => !startingXI.some((p) => p.id === player.id));

  const captain = startingXI.find((player) => player.id === captainId) || startingXI[0];
  const vice = startingXI.find((player) => player.id === viceId && player.id !== captain?.id) || startingXI[1];

  const suggestions = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return [];
    return players.filter((player) => player.web_name.toLowerCase().includes(search) || player.team_name.toLowerCase().includes(search)).slice(0, 8);
  }, [players, query]);

  const addPlayer = (player: PlayerRow) => {
    const check = canAddPlayerToSquad(squad, player, budgetRemaining);
    if (!check.allowed) {
      setError(check.reason || 'تعذر إضافة اللاعب');
      return;
    }
    setError('');
    setSquad((current) => [...current, player]);
    setQuery('');
  };

  const removePlayer = (id: number) => {
    setSquad((current) => current.filter((player) => player.id !== id));
    if (captainId === id) setCaptainId(null);
    if (viceId === id) setViceId(null);
    setError('');
  };

  const positionCounts = POSITION_ORDER.map((position) => ({
    position,
    count: squad.filter((player) => player.position === position).length,
    limit: SQUAD_RULES.positionLimits[position],
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryTile label="الميزانية المتبقية" value={formatPrice(budgetRemaining)} highlight={budgetRemaining < 0} />
        <SummaryTile label="عدد اللاعبين" value={`${squad.length}/${SQUAD_RULES.totalPlayers}`} />
        <SummaryTile label="الإنفاق" value={formatPrice(spent)} />
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-slate-300">إضافة لاعب للتشكيلة</p>
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            {positionCounts.map(({ position, count, limit }) => (
              <span key={position} className={`rounded-full border px-2 py-1 ${count >= limit ? 'border-emerald-400/30 text-emerald-200' : 'border-white/10'}`}>
                {position}: {count}/{limit}
              </span>
            ))}
          </div>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن لاعب لإضافته..."
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-2.5 pl-3 pr-9 text-sm text-white outline-none focus:border-emerald-400/80"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-xl">
              {suggestions.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => addPlayer(player)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-right text-sm text-slate-200 transition hover:bg-emerald-500/10"
                >
                  <span className="flex items-center gap-2">
                    {player.web_name} <span className="text-xs text-slate-500">{player.team_name}</span>
                    <PositionPill position={player.position} />
                  </span>
                  <span className="text-xs text-slate-400">{formatPrice(player.now_cost)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
      </div>

      {squad.length > 0 && (
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
          <p className="mb-3 text-sm font-bold text-slate-300">التشكيلة الحالية (15 لاعبًا)</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {squad.map((player) => (
              <div key={player.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-sm">
                <div>
                  <p className="font-bold text-white">{player.web_name}</p>
                  <p className="text-xs text-slate-400">
                    {player.team_name} · {formatPrice(player.now_cost)}
                  </p>
                </div>
                <button type="button" onClick={() => removePlayer(player.id)} aria-label={`إزالة ${player.web_name}`} className="text-rose-300 transition hover:text-rose-200">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-300">التشكيلة الأساسية</p>
          <select
            value={formationKey}
            onChange={(event) => setFormationKey(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none"
          >
            {VALID_FORMATIONS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.key}
              </option>
            ))}
          </select>
        </div>

        {startingXI.length ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {startingXI.map((player) => (
              <div key={player.id} className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-3 text-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold text-white">{player.web_name}</span>
                  <PositionPill position={player.position} />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCaptainId(player.id)}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold transition ${
                      captain?.id === player.id ? 'border-amber-400/50 bg-amber-500/20 text-amber-200' : 'border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Crown size={11} /> قائد
                  </button>
                  <button
                    type="button"
                    onClick={() => setViceId(player.id)}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold transition ${
                      vice?.id === player.id ? 'border-sky-400/50 bg-sky-500/20 text-sky-200' : 'border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ShieldHalf size={11} /> نائب
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">أضف لاعبين لتظهر التشكيلة الأساسية هنا.</p>
        )}

        {bench.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-bold text-slate-400">الدكة</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {bench.map((player) => (
                <div key={player.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-2.5 text-center text-xs text-slate-300">
                  {player.web_name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryTile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 text-center ${highlight ? 'border-rose-400/40 bg-rose-500/10' : 'border-white/10 bg-slate-900/70'}`}>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-lg font-black ${highlight ? 'text-rose-200' : 'text-white'}`}>{value}</p>
    </div>
  );
}
