'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, BadgeCheck, BarChart3, CalendarRange, CircleDollarSign, Clock3, Shield, Sword, Target, Trophy, UserRound } from 'lucide-react';
import type { FplApiResponse, FplFixture, FplPlayer } from '@/types/fpl';
import { buildAnalysis, formatArabic, getFriendlyApiError, getPlayerPositionName, getBudget } from '@/lib/fpl';

function formatTeamValue(value: number | undefined): string {
  return `${((value ?? 0) / 10).toFixed(1)}M`;
}

function formatFixtureDate(dateText: string): string {
  if (!dateText) return '—';
  try {
    const date = new Date(dateText);
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
  } catch {
    return dateText;
  }
}

function getCountdown(deadline?: string | null) {
  if (!deadline) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const diff = new Date(deadline).getTime() - Date.now();
  const safeDiff = Math.max(diff, 0);
  return {
    days: Math.floor(safeDiff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((safeDiff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((safeDiff / (1000 * 60)) % 60),
    seconds: Math.floor((safeDiff / 1000) % 60),
  };
}

const preseasonPresetPlayers: FplPlayer[] = [
  { id: 101, first_name: 'أليسون', second_name: 'بيكر', web_name: 'أليسون', position: 'GK', team: 1, team_name: 'ليفربول', total_points: 0, points_per_game: 0, now_cost: 55, selected_by_percent: 14, form: 0, goals_scored: 0, assists: 0, goals_conceded: 0, clean_sheets: 0, bonus: 0, minutes: 0, starts: 0, influence: 0, creativity: 0, threat: 0, ict_index: 0, news: '', status: '', is_captain: false, is_vice_captain: false, is_on_bench: false, is_starting: true, fixture_difficulty: 2, chip: null },
  { id: 102, first_name: 'ترنت', second_name: 'ألكسندر-أرنولد', web_name: 'أرنولد', position: 'DEF', team: 1, team_name: 'ليفربول', total_points: 0, points_per_game: 0, now_cost: 70, selected_by_percent: 18, form: 0, goals_scored: 0, assists: 0, goals_conceded: 0, clean_sheets: 0, bonus: 0, minutes: 0, starts: 0, influence: 0, creativity: 0, threat: 0, ict_index: 0, news: '', status: '', is_captain: false, is_vice_captain: false, is_on_bench: false, is_starting: true, fixture_difficulty: 3, chip: null },
  { id: 103, first_name: 'فابيو', second_name: 'كوانتراو', web_name: 'كوانتراو', position: 'DEF', team: 2, team_name: 'تشيلسي', total_points: 0, points_per_game: 0, now_cost: 62, selected_by_percent: 12, form: 0, goals_scored: 0, assists: 0, goals_conceded: 0, clean_sheets: 0, bonus: 0, minutes: 0, starts: 0, influence: 0, creativity: 0, threat: 0, ict_index: 0, news: '', status: '', is_captain: false, is_vice_captain: false, is_on_bench: false, is_starting: true, fixture_difficulty: 3, chip: null },
  { id: 104, first_name: 'كيران', second_name: 'تريبير', web_name: 'تريبير', position: 'DEF', team: 3, team_name: 'مانشستر سيتي', total_points: 0, points_per_game: 0, now_cost: 64, selected_by_percent: 11, form: 0, goals_scored: 0, assists: 0, goals_conceded: 0, clean_sheets: 0, bonus: 0, minutes: 0, starts: 0, influence: 0, creativity: 0, threat: 0, ict_index: 0, news: '', status: '', is_captain: false, is_vice_captain: false, is_on_bench: false, is_starting: true, fixture_difficulty: 2, chip: null },
  { id: 105, first_name: 'ديكلان', second_name: 'رايس', web_name: 'رايس', position: 'MID', team: 4, team_name: 'أرسنال', total_points: 0, points_per_game: 0, now_cost: 82, selected_by_percent: 24, form: 0, goals_scored: 0, assists: 0, goals_conceded: 0, clean_sheets: 0, bonus: 0, minutes: 0, starts: 0, influence: 0, creativity: 0, threat: 0, ict_index: 0, news: '', status: '', is_captain: false, is_vice_captain: false, is_on_bench: false, is_starting: true, fixture_difficulty: 2, chip: null },
  { id: 106, first_name: 'بوكايو', second_name: 'ساكا', web_name: 'ساكا', position: 'MID', team: 4, team_name: 'أرسنال', total_points: 0, points_per_game: 0, now_cost: 88, selected_by_percent: 28, form: 0, goals_scored: 0, assists: 0, goals_conceded: 0, clean_sheets: 0, bonus: 0, minutes: 0, starts: 0, influence: 0, creativity: 0, threat: 0, ict_index: 0, news: '', status: '', is_captain: false, is_vice_captain: false, is_on_bench: false, is_starting: true, fixture_difficulty: 2, chip: null },
  { id: 107, first_name: 'موسى', second_name: 'سايس', web_name: 'سايس', position: 'MID', team: 5, team_name: 'توتنهام', total_points: 0, points_per_game: 0, now_cost: 78, selected_by_percent: 16, form: 0, goals_scored: 0, assists: 0, goals_conceded: 0, clean_sheets: 0, bonus: 0, minutes: 0, starts: 0, influence: 0, creativity: 0, threat: 0, ict_index: 0, news: '', status: '', is_captain: false, is_vice_captain: false, is_on_bench: false, is_starting: true, fixture_difficulty: 4, chip: null },
  { id: 108, first_name: 'إيدرسون', second_name: 'إبراهيم', web_name: 'إبراهيم', position: 'MID', team: 6, team_name: 'إيفرتون', total_points: 0, points_per_game: 0, now_cost: 74, selected_by_percent: 15, form: 0, goals_scored: 0, assists: 0, goals_conceded: 0, clean_sheets: 0, bonus: 0, minutes: 0, starts: 0, influence: 0, creativity: 0, threat: 0, ict_index: 0, news: '', status: '', is_captain: false, is_vice_captain: false, is_on_bench: false, is_starting: true, fixture_difficulty: 3, chip: null },
  { id: 109, first_name: 'هاري', second_name: 'كين', web_name: 'كين', position: 'FWD', team: 7, team_name: 'بايرن', total_points: 0, points_per_game: 0, now_cost: 94, selected_by_percent: 32, form: 0, goals_scored: 0, assists: 0, goals_conceded: 0, clean_sheets: 0, bonus: 0, minutes: 0, starts: 0, influence: 0, creativity: 0, threat: 0, ict_index: 0, news: '', status: '', is_captain: false, is_vice_captain: false, is_on_bench: false, is_starting: true, fixture_difficulty: 2, chip: null },
  { id: 110, first_name: 'عمر', second_name: 'مرباح', web_name: 'مرباح', position: 'FWD', team: 8, team_name: 'أستون فيلا', total_points: 0, points_per_game: 0, now_cost: 83, selected_by_percent: 20, form: 0, goals_scored: 0, assists: 0, goals_conceded: 0, clean_sheets: 0, bonus: 0, minutes: 0, starts: 0, influence: 0, creativity: 0, threat: 0, ict_index: 0, news: '', status: '', is_captain: false, is_vice_captain: false, is_on_bench: false, is_starting: true, fixture_difficulty: 3, chip: null },
  { id: 111, first_name: 'إيرلينغ', second_name: 'هالاند', web_name: 'هالاند', position: 'FWD', team: 3, team_name: 'مانشستر سيتي', total_points: 0, points_per_game: 0, now_cost: 98, selected_by_percent: 35, form: 0, goals_scored: 0, assists: 0, goals_conceded: 0, clean_sheets: 0, bonus: 0, minutes: 0, starts: 0, influence: 0, creativity: 0, threat: 0, ict_index: 0, news: '', status: '', is_captain: false, is_vice_captain: false, is_on_bench: false, is_starting: true, fixture_difficulty: 1, chip: null },
  { id: 112, first_name: 'برونو', second_name: 'فيرن', web_name: 'فيرن', position: 'MID', team: 9, team_name: 'مانشستر يونايتد', total_points: 0, points_per_game: 0, now_cost: 74, selected_by_percent: 19, form: 0, goals_scored: 0, assists: 0, goals_conceded: 0, clean_sheets: 0, bonus: 0, minutes: 0, starts: 0, influence: 0, creativity: 0, threat: 0, ict_index: 0, news: '', status: '', is_captain: false, is_vice_captain: false, is_on_bench: false, is_starting: true, fixture_difficulty: 3, chip: null },
  { id: 113, first_name: 'ماركوس', second_name: 'راشفورد', web_name: 'راشفورد', position: 'FWD', team: 9, team_name: 'مانشستر يونايتد', total_points: 0, points_per_game: 0, now_cost: 81, selected_by_percent: 17, form: 0, goals_scored: 0, assists: 0, goals_conceded: 0, clean_sheets: 0, bonus: 0, minutes: 0, starts: 0, influence: 0, creativity: 0, threat: 0, ict_index: 0, news: '', status: '', is_captain: false, is_vice_captain: false, is_on_bench: false, is_starting: true, fixture_difficulty: 3, chip: null },
];

export default function TeamAnalyzer() {
  const [teamId, setTeamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<FplApiResponse | null>(null);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [fixtures, setFixtures] = useState<FplFixture[]>([]);
  const [manualMode, setManualMode] = useState(false);
  const [manualPlayers, setManualPlayers] = useState<FplPlayer[]>([]);
  const [manualEvaluation, setManualEvaluation] = useState<FplApiResponse | null>(null);

  useEffect(() => {
    async function loadMeta() {
      try {
        const response = await fetch('/api/fpl');
        const data = await response.json();
        if (data?.success && data?.data) {
          const nextDeadline = data.data.nextDeadline || data.data.deadline || null;
          if (nextDeadline) setDeadline(nextDeadline);
          if (Array.isArray(data.data.fixtures)) setFixtures(data.data.fixtures);
        }
      } catch {
        // Ignore meta fetch failure gracefully.
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    if (result?.nextDeadline || result?.deadline) setDeadline(result.nextDeadline || result.deadline || null);
    if (Array.isArray(result?.fixtures) && result.fixtures.length) setFixtures(result.fixtures);
  }, [result]);

  const countdown = getCountdown(deadline);

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
      if (!response.ok || !data?.success) throw new Error(data?.message || 'Failed');

      setResult(data.data);
      if (data.data?.nextDeadline || data.data?.deadline) setDeadline(data.data.nextDeadline || data.data.deadline);
      if (Array.isArray(data.data?.fixtures)) setFixtures(data.data.fixtures);
    } catch (apiError) {
      setError(apiError instanceof Error ? getFriendlyApiError(apiError) : 'تعذر جلب بيانات الفريق. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const squadByRole = useMemo(() => {
    const squads: Record<'GK' | 'DEF' | 'MID' | 'FWD' | 'BENCH', FplPlayer[]> = { GK: [], DEF: [], MID: [], FWD: [], BENCH: [] };
    const allPlayers = result?.players ?? [];
    for (const player of allPlayers) {
      if (player.is_on_bench) squads.BENCH.push(player);
      else if (player.position === 'GK') squads.GK.push(player);
      else if (player.position === 'DEF') squads.DEF.push(player);
      else if (player.position === 'MID') squads.MID.push(player);
      else if (player.position === 'FWD') squads.FWD.push(player);
      else squads.BENCH.push(player);
    }
    return squads;
  }, [result?.players]);

  const hasSquadData = Boolean(result && Array.isArray(result.players) && result.players.length > 0);
  const isSeasonNotStarted = Boolean(
    result && Array.isArray(result.players) && result.players.length === 0 && !result.deadline && !result.nextDeadline,
  );
  const isSquadLoading = loading || (!result && !error);

  const toggleManualPlayer = (player: FplPlayer) => {
    setManualPlayers((current) => {
      const exists = current.some((item) => item.id === player.id);
      if (exists) return current.filter((item) => item.id !== player.id);
      return [...current, player];
    });
    setManualEvaluation(null);
  };

  const evaluateManualSquad = () => {
    if (manualPlayers.length < 11) return;

    const selectedPlayers = manualPlayers.slice(0, 11).map((player, index) => ({
      ...player,
      is_captain: index === 0,
      is_vice_captain: index === 1,
      is_on_bench: false,
      is_starting: true,
    }));

    const teamValue = selectedPlayers.reduce((total, player) => total + Number(player.now_cost ?? 0), 0);
    const team: FplApiResponse['team'] = {
      id: 0,
      name: 'تشكيلة مخصصة',
      manager_name: 'مستخدم',
      overall_points: 0,
      overall_rank: null,
      gameweek_points: 0,
      gameweek_rank: null,
      bank: 48,
      value: teamValue,
      transfers: 0,
      transfer_cost: 0,
      summary: 'تقييم تشكيلة مخصصة',
    };

    setManualEvaluation({ team, players: selectedPlayers, gameweek: 1, analysis: buildAnalysis(selectedPlayers, team) });
  };

  const scrollToTeamForm = () => {
    document.getElementById('team-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <section className="mb-8 grid gap-6 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 p-4 shadow-glow backdrop-blur-sm md:grid-cols-[1.3fr_0.7fr] md:p-8">
        <div className="space-y-6">
          <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">تحليل ذكي • FPL</span>

          <div className="space-y-4">
            <h1 className="text-balance text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">حلّل فريقك في الفانتازي بذكاء</h1>
            <p className="max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              أدخل معرّف فريقك في FPL واحصل على تحليل شامل لتشكيلتك، لاعبيك، القائد، ونقاط القوة والضعف.
            </p>
          </div>

          <div id="team-form" className="space-y-4">
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
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-violet-400/20 bg-slate-900/70 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400">تقييم قبل الموسم</p>
                <h3 className="text-xl font-black text-white">تقييم التشكيلة يدويًا</h3>
              </div>
              <button
                type="button"
                onClick={() => setManualMode((value) => !value)}
                className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-bold text-violet-200"
              >
                {manualMode ? 'إخفاء' : 'فتح'}
              </button>
            </div>

            {manualMode && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-300">
                  <span>اللاعبون المختارين: {manualPlayers.length}/11</span>
                  <span className="font-bold text-emerald-200">{manualPlayers.length >= 11 ? 'جاهز للتقييم' : 'اختر 11 لاعبًا'}</span>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {preseasonPresetPlayers.map((player) => {
                    const selected = manualPlayers.some((item) => item.id === player.id);
                    return (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => toggleManualPlayer(player)}
                        className={`rounded-2xl border p-3 text-right transition ${selected ? 'border-emerald-400/60 bg-emerald-500/10 text-white' : 'border-white/10 bg-slate-950/60 text-slate-200 hover:border-violet-400/40'}`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <span className="font-black">{player.web_name}</span>
                          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200">{player.position}</span>
                        </div>
                        <div className="text-xs text-slate-300">{player.team_name}</div>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={evaluateManualSquad}
                  disabled={manualPlayers.length < 11}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-400 to-cyan-300 px-4 py-2.5 text-sm font-black text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  تقييم هذه التشكيلة
                </button>

                {manualEvaluation && (
                  <div className="rounded-[1.4rem] border border-emerald-400/20 bg-emerald-500/5 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">التقييم الحالي</p>
                        <h4 className="text-2xl font-black text-white">{manualEvaluation.analysis.overallScore}/100</h4>
                      </div>
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-200">تشكيلة مخصصة</span>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {manualEvaluation.analysis.categories.map((category) => (
                        <div key={category.name} className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                            <span>{category.name}</span>
                            <span className="font-bold text-emerald-200">{category.score}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300" style={{ width: `${category.score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

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

          <div className="mt-5 rounded-2xl border border-violet-400/20 bg-slate-900/70 p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span>الجولة القادمة تبدأ خلال</span>
              <Clock3 size={14} className="text-violet-300" />
            </div>
            <div className="flex items-center justify-between gap-2 text-center text-white">
              <CountdownBox value={countdown.days} label="يوم" />
              <CountdownBox value={countdown.hours} label="س" />
              <CountdownBox value={countdown.minutes} label="د" />
              <CountdownBox value={countdown.seconds} label="ث" />
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">المباريات القادمة</p>
            <h3 className="text-2xl font-black">المباريات القادمة</h3>
          </div>
          <CalendarRange className="text-emerald-300" />
        </div>
        {fixtures.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {fixtures.map((fixture) => (
              <div key={fixture.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                  <span>GW {formatArabic(fixture.event)}</span>
                  <span>{formatFixtureDate(fixture.kickoff_time)}</span>
                </div>
                <div className="space-y-2 text-sm text-slate-200">
                  <div className="flex items-center justify-between">
                    <span>{fixture.team_h_name}</span>
                    <span className="font-black text-white">{fixture.team_h_score ?? '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>vs</span>
                    <span>{' '}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{fixture.team_a_name}</span>
                    <span className="font-black text-white">{fixture.team_a_score ?? '—'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-5 text-slate-300">جارٍ إحضار المباريات القادمة من FPL...</div>
        )}
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
                  <h4 className="mb-3 flex items-center gap-2 text-lg font-bold text-emerald-200">
                    <BadgeCheck size={18} /> نقاط القوة
                  </h4>
                  <ul className="space-y-3 text-sm leading-7 text-slate-200">
                    {result.analysis.strengths.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/5 p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-lg font-bold text-rose-200">
                    <AlertTriangle size={18} /> نقاط الضعف
                  </h4>
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
                <PositionGroup title="حارس المرمى" players={squadByRole.GK} isLoading={isSquadLoading} hasData={hasSquadData} seasonNotStarted={isSeasonNotStarted} />
                <PositionGroup title="الدفاع" players={squadByRole.DEF} isLoading={isSquadLoading} hasData={hasSquadData} seasonNotStarted={isSeasonNotStarted} />
                <PositionGroup title="الوسط" players={squadByRole.MID} isLoading={isSquadLoading} hasData={hasSquadData} seasonNotStarted={isSeasonNotStarted} />
                <PositionGroup title="الهجوم" players={squadByRole.FWD} isLoading={isSquadLoading} hasData={hasSquadData} seasonNotStarted={isSeasonNotStarted} />
                <div className="pt-2">
                  <h4 className="mb-3 text-lg font-bold text-slate-200">الدكة</h4>
                  {isSquadLoading ? (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {[1, 2, 3, 4].map((item) => (
                        <LoadingPlayerCard key={item} />
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {squadByRole.BENCH.length ? (
                        squadByRole.BENCH.map((player) => <PlayerMiniCard key={player.id} player={player} />)
                      ) : (
                        <EmptySlot text="الدكة" seasonNotStarted={isSeasonNotStarted} />
                      )}
                    </div>
                  )}
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

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/70 px-2 py-2 text-center min-w-[58px]">
      <div className="text-lg font-black text-white">{formatArabic(value)}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
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

function PositionGroup({
  title,
  players,
  isLoading,
  hasData,
  seasonNotStarted,
}: {
  title: string;
  players: FplPlayer[];
  isLoading: boolean;
  hasData: boolean;
  seasonNotStarted: boolean;
}) {
  return (
    <div>
      <h4 className="mb-3 text-lg font-bold text-slate-200">{title}</h4>
      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <LoadingPlayerCard key={item} />
          ))}
        </div>
      ) : players.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {players.map((player) => (
            <PlayerMiniCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-4 text-sm text-slate-400">
          {seasonNotStarted
            ? 'لم يبدأ الموسم بعد — ستظهر تشكيلتك هنا بعد إغلاق باب التحويلات للجولة الأولى'
            : hasData
              ? `${title}: لا توجد لاعبين في هذا الدور حاليًا`
              : 'لا توجد بيانات للفريق في الوقت الحالي'}
        </div>
      )}
    </div>
  );
}

function LoadingPlayerCard() {
  return (
    <div className="animate-pulse rounded-[1.3rem] border border-white/10 bg-slate-900/75 p-3">
      <div className="mb-3 h-5 w-2/3 rounded-full bg-slate-700" />
      <div className="mb-2 h-4 w-1/2 rounded-full bg-slate-700" />
      <div className="h-4 w-full rounded-full bg-slate-700" />
    </div>
  );
}

function EmptySlot({ text, seasonNotStarted }: { text: string; seasonNotStarted: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-4 text-sm text-slate-400">
      {seasonNotStarted ? 'لم يبدأ الموسم بعد — ستظهر تشكيلتك هنا بعد إغلاق باب التحويلات للجولة الأولى' : `${text}: لا توجد بيانات للفريق في الوقت الحالي`}
    </div>
  );
}

function PlayerMiniCard({ player }: { player: FplPlayer }) {
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
        <span>{getPlayerPositionName(player.position)}</span>
        <span>£{(player.now_cost / 10).toFixed(1)}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>نقاط: {formatArabic(player.total_points ?? 0)}</span>
        <span>{formatArabic(player.selected_by_percent ?? 0)}%</span>
      </div>
    </div>
  );
}
