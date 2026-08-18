'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, BarChart3, BadgeCheck, CalendarRange, CircleDollarSign, Shield, Sword, Target, Trophy, UserRound, Zap } from 'lucide-react';
import type { FplApiResponse, FplPlayer } from '@/types/fpl';
import { formatArabic, getFriendlyApiError, getPlayerPositionName, getBudget } from '@/lib/fpl';

const defaultState: FplApiResponse | null = null;

function formatTeamValue(value: number | undefined): string {
  return `${((value ?? 0) / 10).toFixed(1)}M`;
}

function formatPosition(position: string): string {
  return getPlayerPositionName(position);
}

export default function HomePage() {
  const [teamId, setTeamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<FplApiResponse | null>(defaultState);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const id = teamId.trim();

    if (!/^[0-9]+$/.test(id) || Number(id) <= 0) {
      setError('أدخل معرّف فريق صحيح يتكون من أرقام فقط.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/fpl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: id }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed');
      }

      setResult(data.data);
    } catch (apiError) {
      setError(apiError instanceof Error ? getFriendlyApiError(apiError) : 'تعذر جلب بيانات الفريق. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const squadByRole = useMemo(() => {
    const emptySquads: Record<'GK' | 'DEF' | 'MID' | 'FWD' | 'BENCH', FplPlayer[]> = {
      GK: [],
      DEF: [],
      MID: [],
      FWD: [],
      BENCH: [],
    };

    if (!result?.players?.length) {
      return emptySquads;
    }

    const squads: Record<'GK' | 'DEF' | 'MID' | 'FWD' | 'BENCH', FplPlayer[]> = {
      GK: [],
      DEF: [],
      MID: [],
      FWD: [],
      BENCH: [],
    };

    for (const player of result.players) {
      if (player.is_on_bench) {
        squads.BENCH.push(player);
      } else if (player.position === 'GK') {
        squads.GK.push(player);
      } else if (player.position === 'DEF') {
        squads.DEF.push(player);
      } else if (player.position === 'MID') {
        squads.MID.push(player);
      } else {
        squads.FWD.push(player);
      }
    }

    return squads;
  }, [result]);

  return (
    <main className="rtl min-h-screen text-white">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-lime-300 text-sm font-black text-slate-900 shadow-glow">F</div>
            <div>
              <p className="text-lg font-black tracking-tight">FPL Hafid</p>
              <p className="text-[10px] text-slate-300">منصة تحليل فرق FPL</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200 sm:flex">
            <Zap size={12} />
            <span>Gameweek {result ? formatArabic(result.gameweek) : '—'}</span>
          </div>
        </header>

        <section className="mb-10 grid gap-6 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 p-4 shadow-glow backdrop-blur-sm md:grid-cols-[1.3fr_0.7fr] md:p-8">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">تحليل ذكي • FPL</span>
            <div className="space-y-4">
              <h1 className="text-balance text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                حلّل فريقك في الفانتازي بذكاء
              </h1>
              <p className="max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                أدخل معرّف فريقك في FPL واحصل على تحليل شامل لتشكيلتك، لاعبيك، القائد، ونقاط القوة والضعف.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <input
                    aria-label="معرّف الفريق"
                    type="text"
                    inputMode="numeric"
                    value={teamId}
                    onChange={(event) => setTeamId(event.target.value.replace(/\D/g, ''))}
                    placeholder="أدخل معرّف الفريق"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3.5 text-base text-white outline-none transition focus:border-emerald-400/80 focus:ring-2 focus:ring-emerald-400/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-lime-300 px-5 py-3.5 text-base font-black text-slate-900 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                      جارٍ التحليل...
                    </>
                  ) : (
                    <>
                      <ArrowLeft size={18} />
                      جلب وتحليل
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="rounded-[1.6rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">ملخص سريع</p>
                <h2 className="text-xl font-extrabold">مؤشرات الفريق</h2>
              </div>
              <BarChart3 className="text-emerald-300" />
            </div>
            <div className="space-y-4">
              <MetricCard label="التقييم" value={result ? `${result.analysis.overallScore}/100` : '—'} icon={<BadgeCheck size={16} />} />
              <MetricCard label="نقاط الموسم" value={result ? formatArabic(result.team.overall_points ?? 0) : '—'} icon={<Trophy size={16} />} />
              <MetricCard label="الميزانية" value={result ? getBudget(result.team.bank) : '—'} icon={<CircleDollarSign size={16} />} />
              <MetricCard label="القيمة" value={result ? formatTeamValue(result.team.value) : '—'} icon={<Target size={16} />} />
            </div>
          </div>
        </section>

        {loading && (
          <section className="mb-8 grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <div className="mb-3 h-5 w-24 rounded-full bg-slate-700" />
                <div className="mb-2 h-10 w-2/3 rounded-full bg-slate-700" />
                <div className="h-4 w-1/2 rounded-full bg-slate-700" />
              </div>
            ))}
          </section>
        )}

        {result && (
          <>
            <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard title="اسم المدير" value={result.team.manager_name || '—'} icon={<UserRound size={16} />} />
              <SummaryCard title="النقاط الكلية" value={formatArabic(result.team.overall_points ?? 0)} icon={<Trophy size={16} />} />
              <SummaryCard title="الترتيب العام" value={result.team.overall_rank ? formatArabic(result.team.overall_rank) : '—'} icon={<BarChart3 size={16} />} />
              <SummaryCard title="نقاط الـ GW" value={formatArabic(result.team.gameweek_points ?? 0)} icon={<CalendarRange size={16} />} />
            </section>

            <section className="mb-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">مؤشرات الفريق</p>
                    <h3 className="text-2xl font-black">التقييم العام</h3>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-bold text-emerald-200">{result.analysis.overallScore}/100</span>
                </div>
                <div className="space-y-4">
                  {result.analysis.categories.map((category) => (
                    <div key={category.name}>
                      <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                        <span>{category.name}</span>
                        <span className="font-bold text-emerald-200">{category.score}/100</span>
                      </div>
                      <div className="progress-bar h-2.5 overflow-hidden rounded-full">
                        <div className="progress-fill h-full rounded-full" style={{ width: `${category.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">نقاط القوة والضعف</p>
                    <h3 className="text-2xl font-black">التحليل</h3>
                  </div>
                  <Shield className="text-emerald-300" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4">
                    <h4 className="mb-3 flex items-center gap-2 text-lg font-bold text-emerald-200"><BadgeCheck size={18} /> نقاط القوة</h4>
                    <ul className="space-y-3 text-sm leading-7 text-slate-200">
                      {result.analysis.strengths.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-rose-400/20 bg-rose-500/5 p-4">
                    <h4 className="mb-3 flex items-center gap-2 text-lg font-bold text-rose-200"><AlertTriangle size={18} /> نقاط الضعف</h4>
                    <ul className="space-y-3 text-sm leading-7 text-slate-200">
                      {result.analysis.weaknesses.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">التشكيلة</p>
                  <h3 className="text-2xl font-black">اللاعبون</h3>
                </div>
                <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">{result.players.length} لاعب</div>
              </div>
              <div className="pitch-grid rounded-[1.6rem] border border-white/10 p-4">
                <div className="space-y-6">
                  <PositionGroup title="حارس المرمى" players={squadByRole.GK} />
                  <PositionGroup title="الدفاع" players={squadByRole.DEF} />
                  <PositionGroup title="الوسط" players={squadByRole.MID} />
                  <PositionGroup title="الهجوم" players={squadByRole.FWD} />
                  <div className="pt-2">
                    <h4 className="mb-3 text-lg font-bold text-slate-200">الدكة</h4>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {squadByRole.BENCH.map((player) => (
                        <PlayerCard key={player.id} player={player} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">توصيات</p>
                  <h3 className="text-2xl font-black">توصيات FPL Hafid</h3>
                </div>
                <Sword className="text-emerald-300" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {result.analysis.recommendations.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {!result && !loading && !error && (
          <section className="mb-8 rounded-[1.75rem] border border-dashed border-white/15 bg-slate-950/40 p-8 text-center text-slate-300">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-200">
              <Target size={28} />
            </div>
            <h3 className="mb-2 text-2xl font-black text-white">ابدأ بتحليل فريقك</h3>
            <p>أدخل معرّف الفريق أعلاه لتظهر لك التشكيلة، نقاط القوة، التوصيات، والتقييم الكامل.</p>
          </section>
        )}
      </div>

      <footer className="mt-10 border-t border-white/10 bg-slate-950/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-black text-white">FPL Hafid</p>
            <p>منصة تحليل فرق Fantasy Premier League</p>
          </div>
          <p className="max-w-xl text-xs leading-7 text-slate-400">
            FPL Hafid منصة تحليل مستقلة وليست تابعة أو معتمدة من Fantasy Premier League أو Premier League.
          </p>
        </div>
      </footer>
    </main>
  );
}

function SummaryCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="floating-card rounded-[1.6rem] border border-white/10 bg-slate-950/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-200">{icon}</div>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-3">
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="mt-1 text-lg font-black text-white">{value}</p>
      </div>
      <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-200">{icon}</div>
    </div>
  );
}

function PositionGroup({ title, players }: { title: string; players: any[] }) {
  return (
    <div>
      <h4 className="mb-3 text-lg font-bold text-slate-200">{title}</h4>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {players.length ? players.map((player) => <PlayerCard key={player.id} player={player} />) : <EmptySlot text={title} />}
      </div>
    </div>
  );
}

function EmptySlot({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-4 text-sm text-slate-400">{text} غير متاح</div>;
}

function PlayerCard({ player }: { player: any }) {
  return (
    <div className="player-card rounded-[1.3rem] border border-white/10 bg-slate-900/75 p-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-black text-white">{player.web_name}</p>
          <p className="text-xs text-slate-400">{player.team_name || 'غير معروف'}</p>
        </div>
        <div className="flex gap-1">
          {player.is_captain && <span className="badge bg-amber-500/20 text-amber-200">C</span>}
          {player.is_vice_captain && <span className="badge bg-sky-500/20 text-sky-200">VC</span>}
        </div>
      </div>
      <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
        <span>{formatPosition(player.position)}</span>
        <span>£{(player.now_cost / 10).toFixed(1)}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>نقاط: {formatArabic(player.total_points ?? 0)}</span>
        <span>{player.selected_by_percent ?? 0}%</span>
      </div>
    </div>
  );
}
