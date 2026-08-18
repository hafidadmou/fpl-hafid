'use client';

import { useMemo, useState } from 'react';
import { ArrowLeftRight, Search, X } from 'lucide-react';
import type { FixtureRow, PlayerRow } from '@/types/platform';
import { formatPrice, getPlayerPositionLabel } from '@/lib/fpl-data';
import PositionPill from './PositionPill';

function nextFixtureLabel(player: PlayerRow, fixtures: FixtureRow[]): string {
  const fixture = fixtures.find((f) => !f.finished && (f.team_h === player.team || f.team_a === player.team));
  if (!fixture) return '—';
  const isHome = fixture.team_h === player.team;
  const opponent = isHome ? fixture.team_a_short : fixture.team_h_short;
  return `${opponent} (${isHome ? 'أرض' : 'خارج'})`;
}

function PlayerPicker({
  label,
  players,
  excludeId,
  onSelect,
  selected,
  onClear,
}: {
  label: string;
  players: PlayerRow[];
  excludeId?: number;
  onSelect: (id: number) => void;
  selected?: PlayerRow;
  onClear: () => void;
}) {
  const [query, setQuery] = useState('');
  const suggestions = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return [];
    return players
      .filter((player) => player.id !== excludeId)
      .filter((player) => player.web_name.toLowerCase().includes(search) || player.team_name.toLowerCase().includes(search))
      .slice(0, 8);
  }, [players, query, excludeId]);

  if (selected) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs text-emerald-200">{label}</p>
          <button type="button" onClick={onClear} aria-label="إزالة">
            <X size={14} className="text-emerald-200" />
          </button>
        </div>
        <p className="text-lg font-black text-white">{selected.web_name}</p>
        <p className="text-xs text-slate-400">{selected.team_name}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <p className="mb-2 text-xs text-slate-400">{label}</p>
      <div className="relative">
        <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ابحث عن لاعب..."
          className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-2.5 pl-3 pr-9 text-sm text-white outline-none focus:border-emerald-400/80"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-xl">
          {suggestions.map((player) => (
            <button
              key={player.id}
              type="button"
              onClick={() => {
                onSelect(player.id);
                setQuery('');
              }}
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
  );
}

export default function TransferPlanner({ players, fixtures }: { players: PlayerRow[]; fixtures: FixtureRow[] }) {
  const [sellId, setSellId] = useState<number | null>(null);
  const [buyId, setBuyId] = useState<number | null>(null);

  const sellPlayer = players.find((player) => player.id === sellId);
  const buyPlayer = players.find((player) => player.id === buyId);

  const suggestions = useMemo(() => {
    if (!sellPlayer) return [];
    return players
      .filter((player) => player.position === sellPlayer.position && player.id !== sellPlayer.id)
      .filter((player) => player.minutes > 180)
      .sort((a, b) => b.form - a.form || b.total_points - a.total_points)
      .slice(0, 6);
  }, [players, sellPlayer]);

  const priceDiff = sellPlayer && buyPlayer ? buyPlayer.now_cost - sellPlayer.now_cost : 0;
  const pointsDiff = sellPlayer && buyPlayer ? buyPlayer.total_points - sellPlayer.total_points : 0;
  const formDiff = sellPlayer && buyPlayer ? buyPlayer.form - sellPlayer.form : 0;

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <PlayerPicker label="اللاعب المراد بيعه" players={players} onSelect={setSellId} selected={sellPlayer} onClear={() => setSellId(null)} />
        <PlayerPicker label="اللاعب البديل المحتمل" players={players} excludeId={sellId ?? undefined} onSelect={setBuyId} selected={buyPlayer} onClear={() => setBuyId(null)} />
      </div>

      {sellPlayer && buyPlayer ? (
        <div className="space-y-6">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            <div className="mb-4 flex items-center gap-2">
              <ArrowLeftRight size={18} className="text-emerald-300" />
              <h3 className="text-lg font-black text-white">مقارنة الصفقة</h3>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div />
              <div className="font-bold text-rose-200">{sellPlayer.web_name}</div>
              <div className="font-bold text-emerald-200">{buyPlayer.web_name}</div>

              <div className="text-slate-400">السعر</div>
              <div className="text-white">{formatPrice(sellPlayer.now_cost)}</div>
              <div className="text-white">{formatPrice(buyPlayer.now_cost)}</div>

              <div className="text-slate-400">النقاط الكلية</div>
              <div className="text-white">{sellPlayer.total_points}</div>
              <div className="text-white">{buyPlayer.total_points}</div>

              <div className="text-slate-400">الفورمة</div>
              <div className="text-white">{sellPlayer.form.toFixed(1)}</div>
              <div className="text-white">{buyPlayer.form.toFixed(1)}</div>

              <div className="text-slate-400">المباراة القادمة</div>
              <div className="text-white">{nextFixtureLabel(sellPlayer, fixtures)}</div>
              <div className="text-white">{nextFixtureLabel(buyPlayer, fixtures)}</div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/5 p-5">
            <h3 className="mb-3 text-lg font-black text-white">التحليل</h3>
            <ul className="space-y-2 text-sm leading-7 text-slate-200">
              <li>
                • فرق السعر: {priceDiff > 0 ? `ستحتاج ${formatPrice(Math.abs(priceDiff))} إضافية` : priceDiff < 0 ? `ستوفر ${formatPrice(Math.abs(priceDiff))}` : 'لا فرق في السعر'}
              </li>
              <li>
                • فرق النقاط الكلية: {pointsDiff > 0 ? `${buyPlayer.web_name} يتقدم بفارق ${pointsDiff} نقطة هذا الموسم` : pointsDiff < 0 ? `${sellPlayer.web_name} يتقدم بفارق ${Math.abs(pointsDiff)} نقطة هذا الموسم` : 'نفس عدد النقاط تقريبًا'}
              </li>
              <li>
                • فرق الفورمة الحالية: {formDiff > 0 ? `${buyPlayer.web_name} في فورمة أفضل حاليًا` : formDiff < 0 ? `${sellPlayer.web_name} في فورمة أفضل حاليًا` : 'فورمة متقاربة'}
              </li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">هذا تحليل مبني على البيانات الحالية فقط وليس توصية قاطعة — راجع الإصابات والتشكيلة المتوقعة قبل تنفيذ الانتقال.</p>
          </div>
        </div>
      ) : (
        sellPlayer &&
        suggestions.length > 0 && (
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            <h3 className="mb-3 text-lg font-black text-white">بدائل مقترحة لمركز {getPlayerPositionLabel(sellPlayer.position)}</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {suggestions.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => setBuyId(player.id)}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-right text-sm transition hover:border-emerald-400/40"
                >
                  <span className="font-bold text-white">{player.web_name}</span>
                  <span className="text-xs text-slate-400">
                    {formatPrice(player.now_cost)} · فورمة {player.form.toFixed(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
