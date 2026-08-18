import type { Metadata } from 'next';
import { Repeat } from 'lucide-react';
import { getFixtures, getPlayers } from '@/lib/fpl-data';
import TransferPlanner from '@/components/TransferPlanner';

export const metadata: Metadata = {
  title: 'مخطط الانتقالات',
  description: 'قارن بين لاعب تريد بيعه وبديل محتمل من ناحية السعر، النقاط، الفورمة، والمباريات القادمة قبل اتخاذ قرار الانتقال.',
  alternates: { canonical: '/tools/transfers' },
};

export const revalidate = 300;

export default async function TransferPlannerPage() {
  let players: Awaited<ReturnType<typeof getPlayers>> = [];
  let fixtures: Awaited<ReturnType<typeof getFixtures>> = [];
  let loadError = false;

  try {
    [players, fixtures] = await Promise.all([getPlayers(), getFixtures()]);
  } catch {
    loadError = true;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-500/10 text-sky-200">
          <Repeat size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">مخطط الانتقالات</h1>
          <p className="text-sm text-slate-400">قارن بين اللاعب الحالي والبديل المحتمل قبل تنفيذ الانتقال</p>
        </div>
      </header>

      {loadError ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-100">
          تعذر جلب بيانات اللاعبين حاليًا. حاول تحديث الصفحة بعد قليل.
        </div>
      ) : (
        <TransferPlanner players={players} fixtures={fixtures} />
      )}
    </div>
  );
}
