import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarRange, Crown, Flame, Users2 } from 'lucide-react';
import { getClubs, getCurrentEvent, getFixtures, getPlayers, playerSlug } from '@/lib/fpl-data';
import { rankCaptainCandidates } from '@/lib/analysis-tools';
import DeadlineCountdown from '@/components/DeadlineCountdown';
import PositionPill from '@/components/PositionPill';

export const metadata: Metadata = {
  title: 'مركز الجولة (Gameweek Hub)',
  description: 'كل ما تحتاجه عن الجولة الحالية في FPL: الموعد النهائي، المباريات، أفضل اللاعبين أداءً، وأبرز خيارات القيادة.',
  alternates: { canonical: '/gameweek' },
};

export const revalidate = 300;

export default async function GameweekHubPage() {
  let currentEvent: Awaited<ReturnType<typeof getCurrentEvent>> | null = null;
  let players: Awaited<ReturnType<typeof getPlayers>> = [];
  let clubs: Awaited<ReturnType<typeof getClubs>> = [];
  let fixturesForEvent: Awaited<ReturnType<typeof getFixtures>> = [];
  let loadError = false;

  try {
    const [event, playerList, clubList, allFixtures] = await Promise.all([getCurrentEvent(), getPlayers(), getClubs(), getFixtures()]);
    currentEvent = event || null;
    players = playerList;
    clubs = clubList;
    fixturesForEvent = allFixtures.filter((fixture) => fixture.event === (event?.id ?? -1));
  } catch {
    loadError = true;
  }

  const topPerformers = [...players].sort((a, b) => b.total_points - a.total_points).slice(0, 6);
  const popularPlayers = [...players].sort((a, b) => b.selected_by_percent - a.selected_by_percent).slice(0, 6);
  const captainOptions = rankCaptainCandidates(players, fixturesForEvent.length ? fixturesForEvent : [], { limit: 5 });

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-200">
          <CalendarRange size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">مركز الجولة</h1>
          <p className="text-sm text-slate-400">{currentEvent ? currentEvent.name : 'تحديثات الجولة الحالية'}</p>
        </div>
      </header>

      {loadError ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-100">تعذر جلب بيانات الجولة حاليًا. حاول تحديث الصفحة بعد قليل.</div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
            <DeadlineCountdown deadline={currentEvent?.deadline_time} label="الموعد النهائي خلال" />
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="mb-2 text-xs text-slate-400">متوسط نقاط الجولة الماضية</p>
              <p className="text-2xl font-black text-white">{currentEvent?.average_entry_score ?? '—'}</p>
            </div>
          </div>

          <section className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-white">مباريات الجولة</h2>
              <Link href="/fixtures" className="text-xs font-bold text-emerald-200">
                عرض الكل
              </Link>
            </div>
            {fixturesForEvent.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {fixturesForEvent.map((fixture) => (
                  <div key={fixture.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-center text-sm text-slate-200">
                    {fixture.team_h_short} <span className="text-slate-500">vs</span> {fixture.team_a_short}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">لا توجد مباريات مؤكدة بعد لهذه الجولة.</p>
            )}
          </section>

          <section className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Flame size={18} className="text-emerald-300" />
              <h2 className="text-xl font-black text-white">أفضل اللاعبين أداءً هذا الموسم</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {topPerformers.map((player, index) => (
                <Link key={player.id} href={`/players/${playerSlug(player)}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-sm transition hover:border-emerald-400/30">
                  <span className="flex items-center gap-2">
                    <span className="text-slate-500">#{index + 1}</span>
                    <span className="font-bold text-white">{player.web_name}</span>
                    <PositionPill position={player.position} />
                  </span>
                  <span className="text-emerald-200">{player.total_points} نقطة</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users2 size={18} className="text-sky-300" />
              <h2 className="text-xl font-black text-white">اللاعبون الأكثر امتلاكًا</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {popularPlayers.map((player) => (
                <Link key={player.id} href={`/players/${playerSlug(player)}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-sm transition hover:border-emerald-400/30">
                  <span className="font-bold text-white">{player.web_name}</span>
                  <span className="text-sky-200">{player.selected_by_percent.toFixed(1)}٪</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/5 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown size={18} className="text-amber-300" />
                <h2 className="text-xl font-black text-white">أبرز خيارات القيادة</h2>
              </div>
              <Link href="/tools/captain" className="text-xs font-bold text-amber-200">
                عرض الأداة الكاملة
              </Link>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {captainOptions.map((candidate, index) => (
                <Link key={candidate.player.id} href={`/players/${playerSlug(candidate.player)}`} className="flex items-center justify-between rounded-2xl border border-amber-400/20 bg-slate-950/60 p-3 text-sm transition hover:border-amber-400/40">
                  <span className="flex items-center gap-2">
                    <span className="text-slate-500">#{index + 1}</span>
                    <span className="font-bold text-white">{candidate.player.web_name}</span>
                  </span>
                  <span className="text-amber-200">{candidate.score}</span>
                </Link>
              ))}
            </div>
          </section>

          <p className="text-center text-xs text-slate-500">البيانات مبنية على {clubs.length} ناديًا و{players.length} لاعبًا من الواجهة الرسمية لـ FPL.</p>
        </div>
      )}
    </div>
  );
}
