import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import { getClubs, getPlayers } from '@/lib/fpl-data';
import PlayersExplorer from '@/components/PlayersExplorer';

export const metadata: Metadata = {
  title: 'قاعدة بيانات اللاعبين',
  description: 'تصفح جميع لاعبي البريميرليغ مع فلاتر حسب المركز، النادي، السعر، والإحصائيات، واطّلع على بطاقة كل لاعب.',
  alternates: { canonical: '/players' },
};

export const revalidate = 300;

export default async function PlayersPage() {
  let players: Awaited<ReturnType<typeof getPlayers>> = [];
  let clubs: Awaited<ReturnType<typeof getClubs>> = [];
  let loadError = false;

  try {
    [players, clubs] = await Promise.all([getPlayers(), getClubs()]);
  } catch {
    loadError = true;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-200">
          <Users size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">اللاعبون</h1>
          <p className="text-sm text-slate-400">قاعدة بيانات كاملة للاعبي الدوري الإنجليزي الممتاز</p>
        </div>
      </header>

      {loadError ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-100">
          تعذر جلب بيانات اللاعبين من خادم FPL حاليًا. حاول تحديث الصفحة بعد قليل.
        </div>
      ) : (
        <PlayersExplorer players={players} clubs={clubs} />
      )}
    </div>
  );
}
