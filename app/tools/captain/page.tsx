import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, Crown } from 'lucide-react';
import { formatPrice, getFixtures, getPlayers, playerSlug } from '@/lib/fpl-data';
import { rankCaptainCandidates } from '@/lib/analysis-tools';
import PositionPill from '@/components/PositionPill';

export const metadata: Metadata = {
  title: 'اختيار القائد',
  description: 'ترتيب تحليلي لأفضل خيارات القيادة (Captain) للجولة القادمة بناءً على الفورمة، صعوبة المباراة، ونسبة الامتلاك.',
  alternates: { canonical: '/tools/captain' },
};

export const revalidate = 300;

export default async function CaptainAnalyzerPage() {
  let candidates: ReturnType<typeof rankCaptainCandidates> = [];
  let loadError = false;

  try {
    const [players, fixtures] = await Promise.all([getPlayers(), getFixtures()]);
    candidates = rankCaptainCandidates(players, fixtures, { limit: 10 });
  } catch {
    loadError = true;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/10 text-amber-200">
          <Crown size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">اختيار القائد</h1>
          <p className="text-sm text-slate-400">ترتيب تحليلي لأفضل خيارات القيادة للجولة القادمة</p>
        </div>
      </header>

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4 text-sm leading-7 text-amber-100">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <p>هذا الترتيب توجيه تحليلي مبني على الفورمة، صعوبة المباراة القادمة، ونسبة الامتلاك — وليس ضمانًا لأداء اللاعب.</p>
      </div>

      {loadError ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-100">
          تعذر جلب بيانات اللاعبين حاليًا. حاول تحديث الصفحة بعد قليل.
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.map((candidate, index) => (
            <Link
              key={candidate.player.id}
              href={`/players/${playerSlug(candidate.player)}`}
              className="flex items-center gap-4 rounded-[1.4rem] border border-white/10 bg-slate-950/60 p-4 transition hover:border-emerald-400/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-lg font-black text-emerald-200">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-base font-black text-white">{candidate.player.web_name}</p>
                  <PositionPill position={candidate.player.position} />
                  <span className="text-xs text-slate-500">{candidate.player.team_name}</span>
                </div>
                <p className="text-xs leading-6 text-slate-400">{candidate.reasons.join(' • ')}</p>
              </div>
              <div className="hidden text-center sm:block">
                <p className="text-xs text-slate-500">السعر</p>
                <p className="text-sm font-bold text-white">{formatPrice(candidate.player.now_cost)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">التقييم</p>
                <p className="text-lg font-black text-emerald-300">{candidate.score}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
