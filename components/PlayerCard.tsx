import Link from 'next/link';
import type { PlayerRow } from '@/types/platform';
import { formatPrice, playerSlug } from '@/lib/fpl-data';
import PositionPill from './PositionPill';

export default function PlayerCard({ player, rank }: { player: PlayerRow; rank?: number }) {
  return (
    <Link
      href={`/players/${playerSlug(player)}`}
      className="group rounded-[1.3rem] border border-white/10 bg-slate-900/70 p-4 transition hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-slate-900"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-base font-black text-white group-hover:text-emerald-200">
            {rank ? <span className="ml-1 text-slate-500">#{rank}</span> : null}
            {player.web_name}
          </p>
          <p className="text-xs text-slate-400">{player.team_name}</p>
        </div>
        <PositionPill position={player.position} />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span>{formatPrice(player.now_cost)}</span>
        <span>{player.selected_by_percent.toFixed(1)}٪ امتلاك</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>نقاط: {player.total_points}</span>
        <span>فورمة: {player.form.toFixed(1)}</span>
      </div>
    </Link>
  );
}
