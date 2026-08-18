import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Award, Goal, ShieldCheck, Timer, TrendingUp, Users2 } from 'lucide-react';
import { formatPrice, getPlayerPositionLabel, getPlayers, getUpcomingFixturesForClub, parseIdFromSlug } from '@/lib/fpl-data';
import PositionPill from '@/components/PositionPill';

export const revalidate = 300;

const DIFFICULTY_STYLES: Record<number, string> = {
  1: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
  2: 'bg-emerald-500/10 text-emerald-200 border-emerald-400/20',
  3: 'bg-slate-500/20 text-slate-200 border-slate-400/20',
  4: 'bg-rose-500/10 text-rose-200 border-rose-400/20',
  5: 'bg-rose-500/20 text-rose-200 border-rose-400/30',
};

async function loadPlayer(playerSlug: string) {
  const id = parseIdFromSlug(playerSlug);
  if (!Number.isFinite(id)) return null;
  const players = await getPlayers();
  return players.find((player) => player.id === id) || null;
}

export async function generateMetadata({ params }: { params: { playerSlug: string } }): Promise<Metadata> {
  const player = await loadPlayer(params.playerSlug).catch(() => null);
  if (!player) return { title: 'لاعب غير موجود' };
  return {
    title: `${player.web_name} — ${player.team_name}`,
    description: `إحصائيات ${player.web_name} في Fantasy Premier League: النقاط، الفورمة، السعر، الأهداف، والتمريرات الحاسمة.`,
    alternates: { canonical: `/players/${params.playerSlug}` },
  };
}

export default async function PlayerProfilePage({ params }: { params: { playerSlug: string } }) {
  const player = await loadPlayer(params.playerSlug).catch(() => null);
  if (!player) notFound();

  const fixtures = await getUpcomingFixturesForClub(player.team, 5).catch(() => []);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <Link href="/players" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-emerald-200">
        <ArrowRight size={14} />
        العودة إلى قاعدة اللاعبين
      </Link>

      <section className="mb-6 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <PositionPill position={player.position} />
              <span className="text-xs text-slate-400">{player.team_name}</span>
            </div>
            <h1 className="text-3xl font-black text-white sm:text-4xl">{player.web_name}</h1>
            <p className="mt-1 text-sm text-slate-400">
              {player.first_name} {player.second_name}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-center">
            <p className="text-xs text-emerald-200">السعر الحالي</p>
            <p className="text-2xl font-black text-white">{formatPrice(player.now_cost)}</p>
          </div>
        </div>

        {player.news ? (
          <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-100">{player.news}</div>
        ) : null}
      </section>

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<Award size={16} />} label="النقاط الكلية" value={player.total_points.toString()} />
        <StatCard icon={<TrendingUp size={16} />} label="الفورمة" value={player.form.toFixed(1)} />
        <StatCard icon={<Users2 size={16} />} label="نسبة الامتلاك" value={`${player.selected_by_percent.toFixed(1)}٪`} />
        <StatCard icon={<Timer size={16} />} label="الدقائق" value={player.minutes.toString()} />
        <StatCard icon={<Goal size={16} />} label="الأهداف" value={player.goals_scored.toString()} />
        <StatCard icon={<TrendingUp size={16} />} label="التمريرات الحاسمة" value={player.assists.toString()} />
        <StatCard icon={<ShieldCheck size={16} />} label="شباك نظيفة" value={player.clean_sheets.toString()} />
        <StatCard icon={<Award size={16} />} label="نقاط البونص" value={player.bonus.toString()} />
      </section>

      <section className="mb-6 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
        <h2 className="mb-4 text-xl font-black text-white">إحصائيات متقدمة</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="نقاط لكل مباراة" value={player.points_per_game.toFixed(1)} />
          <StatCard label="مؤشر ICT" value={player.ict_index.toFixed(1)} />
          <StatCard label="التأثير (Influence)" value={player.influence.toFixed(1)} />
          <StatCard label="الإبداع (Creativity)" value={player.creativity.toFixed(1)} />
          <StatCard label="التهديد (Threat)" value={player.threat.toFixed(1)} />
          {player.expected_goals !== undefined && <StatCard label="xG المتوقعة" value={player.expected_goals.toFixed(2)} />}
          {player.expected_assists !== undefined && <StatCard label="xA المتوقعة" value={player.expected_assists.toFixed(2)} />}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
        <h2 className="mb-4 text-xl font-black text-white">المباريات القادمة</h2>
        {fixtures.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fixtures.map((fixture) => {
              const isHome = fixture.team_h === player.team;
              const opponent = isHome ? fixture.team_a_short : fixture.team_h_short;
              const difficulty = isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty;
              return (
                <div key={fixture.id} className={`rounded-2xl border p-3 text-sm ${DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES[3]}`}>
                  <div className="mb-1 flex items-center justify-between text-xs opacity-80">
                    <span>GW {fixture.event ?? '—'}</span>
                    <span>{isHome ? 'أرض' : 'خارج'}</span>
                  </div>
                  <p className="text-base font-black">{opponent}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-400">لا توجد مباريات قادمة متاحة حاليًا لهذا النادي.</p>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-lg font-black text-white">{value}</p>
    </div>
  );
}
