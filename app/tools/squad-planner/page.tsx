import type { Metadata } from 'next';
import { Wrench } from 'lucide-react';
import { getPlayers } from '@/lib/fpl-data';
import SquadPlanner from '@/components/SquadPlanner';

export const metadata: Metadata = {
  title: 'مخطط التشكيلة',
  description: 'ابنِ تشكيلة من 15 لاعبًا ضمن ميزانية £100.0 مليون وقواعد FPL الرسمية، واختر تشكيلتك الأساسية والقائد.',
  alternates: { canonical: '/tools/squad-planner' },
};

export const revalidate = 300;

export default async function SquadPlannerPage() {
  let players: Awaited<ReturnType<typeof getPlayers>> = [];
  let loadError = false;

  try {
    players = await getPlayers();
  } catch {
    loadError = true;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-200">
          <Wrench size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">مخطط التشكيلة</h1>
          <p className="text-sm text-slate-400">جرّب بناء تشكيلة كاملة ضمن ميزانية £100.0 مليون</p>
        </div>
      </header>

      {loadError ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-100">
          تعذر جلب بيانات اللاعبين حاليًا. حاول تحديث الصفحة بعد قليل.
        </div>
      ) : (
        <SquadPlanner players={players} />
      )}
    </div>
  );
}
