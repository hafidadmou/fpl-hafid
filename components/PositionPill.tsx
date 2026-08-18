import type { PlayerPosition } from '@/types/platform';

const STYLES: Record<PlayerPosition, string> = {
  GK: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
  DEF: 'bg-sky-500/15 text-sky-200 border-sky-400/30',
  MID: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
  FWD: 'bg-rose-500/15 text-rose-200 border-rose-400/30',
};

const LABELS: Record<PlayerPosition, string> = { GK: 'حارس', DEF: 'دفاع', MID: 'وسط', FWD: 'هجوم' };

export default function PositionPill({ position }: { position: PlayerPosition }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${STYLES[position]}`}>
      {LABELS[position]}
    </span>
  );
}
