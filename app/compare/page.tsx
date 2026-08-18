import type { Metadata } from 'next';
import { BarChart3 } from 'lucide-react';
import { getFixtures, getPlayers } from '@/lib/fpl-data';
import ComparePlayers from '@/components/ComparePlayers';

export const metadata: Metadata = {
  title: 'مقارنة اللاعبين',
  description: 'قارن حتى 4 لاعبين في Fantasy Premier League من ناحية السعر، النقاط، الفورمة، والإحصائيات، واحصل على استنتاجات تحليلية.',
  alternates: { canonical: '/compare' },
};

export const revalidate = 300;

export default async function ComparePage() {
  let players: Awaited<ReturnType<typeof getPlayers>> = [];
  let fixtures: Awaited<ReturnType<typeof getFixtures>> = [];
  let loadError = false;

  try {
    [players, fixtures] = await Promise.all([getPlayers(), getFixtures()]);
  } catch {
    loadError = true;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-500/10 text-violet-200">
          <BarChart3 size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">مقارنة اللاعبين</h1>
          <p className="text-sm text-slate-400">قارن اللاعبين جنبًا إلى جنب قبل اتخاذ قرار الانتقال</p>
        </div>
      </header>

      {loadError ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-100">
          تعذر جلب بيانات اللاعبين حاليًا. حاول تحديث الصفحة بعد قليل.
        </div>
      ) : (
        <ComparePlayers players={players} fixtures={fixtures} />
      )}
    </div>
  );
}
