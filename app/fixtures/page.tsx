import type { Metadata } from 'next';
import { CalendarRange } from 'lucide-react';
import { getClubs, getEvents, getFixtures } from '@/lib/fpl-data';
import FixturesExplorer from '@/components/FixturesExplorer';

export const metadata: Metadata = {
  title: 'تحليل المباريات',
  description: 'استعرض مباريات البريميرليغ القادمة مع درجة صعوبة كل مباراة (FDR)، وفلاتر حسب النادي والجولة والملعب.',
  alternates: { canonical: '/fixtures' },
};

export const revalidate = 300;

export default async function FixturesPage() {
  let fixtures: Awaited<ReturnType<typeof getFixtures>> = [];
  let clubs: Awaited<ReturnType<typeof getClubs>> = [];
  let events: Awaited<ReturnType<typeof getEvents>> = [];
  let loadError = false;

  try {
    [fixtures, clubs, events] = await Promise.all([getFixtures(), getClubs(), getEvents()]);
  } catch {
    loadError = true;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/10 text-amber-200">
          <CalendarRange size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">تحليل المباريات</h1>
          <p className="text-sm text-slate-400">درجة صعوبة كل مباراة (FDR) مبنية على بيانات FPL الرسمية</p>
        </div>
      </header>

      {loadError ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-100">
          تعذر جلب بيانات المباريات حاليًا. حاول تحديث الصفحة بعد قليل.
        </div>
      ) : (
        <FixturesExplorer fixtures={fixtures} clubs={clubs} events={events} />
      )}
    </div>
  );
}
