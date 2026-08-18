import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  CalendarRange,
  Compass,
  LineChart,
  Newspaper,
  Play,
  Sparkles,
  Target,
  Trophy,
  Users,
  Wrench,
} from 'lucide-react';
import { getClubs, getCurrentEvent, getPlayers } from '@/lib/fpl-data';
import { formatPrice, playerSlug } from '@/lib/fpl-data';
import DeadlineCountdown from '@/components/DeadlineCountdown';

const formationIdeas = [
  { title: '4-3-3', image: '/images/IMG_6979.jpg', subtitle: 'توازن بين الدفاع والوسط والهجوم' },
  { title: '4-2-3-1', image: '/images/IMG_6980.jpg', subtitle: 'ضغط مرتفع ومرونة هجومية' },
  { title: '3-5-2', image: '/images/IMG_6981.jpg', subtitle: 'عرضية واسعة وعمق في الأطراف' },
  { title: '5-3-2', image: '/images/IMG_6982.jpg', subtitle: 'استقرار دفاعي مع جناحين متقدمين' },
  { title: '4-4-2', image: '/images/IMG_7050.jpeg', subtitle: 'تشكيلة تقليدية لبداية الموسم' },
];

const features = [
  { title: 'تحليل الفريق', desc: 'تقييم شامل لتشكيلتك، القائد، ونقاط القوة والضعف بناءً على بياناتك الحقيقية.', href: '/team', icon: Target, accent: 'from-emerald-500/20 to-teal-500/10' },
  { title: 'اللاعبون', desc: 'قاعدة بيانات كاملة للاعبي البريميرليغ مع فلاتر متقدمة وبطاقات لاعبين تفصيلية.', href: '/players', icon: Users, accent: 'from-sky-500/20 to-cyan-500/10' },
  { title: 'مقارنة اللاعبين', desc: 'قارن حتى 4 لاعبين جنبًا إلى جنب في الإحصائيات والفورمة والمباريات القادمة.', href: '/compare', icon: BarChart3, accent: 'from-violet-500/20 to-indigo-500/10' },
  { title: 'تحليل المباريات', desc: 'صعوبة كل مباراة قادمة (FDR) لكل نادٍ مع فلاتر حسب الجولة والفريق.', href: '/fixtures', icon: CalendarRange, accent: 'from-amber-500/20 to-orange-500/10' },
  { title: 'أدوات FPL', desc: 'اختيار القائد، مخطط الانتقالات، ومخطط التشكيلة — كل الأدوات في مكان واحد.', href: '/tools', icon: Wrench, accent: 'from-rose-500/20 to-pink-500/10' },
  { title: 'محتوى FPL', desc: 'مقالات أصلية بالعربية: تحليلات، نصائح، وأخبار FPL أسبوعية.', href: '/articles', icon: Newspaper, accent: 'from-lime-500/20 to-emerald-500/10' },
];

export const revalidate = 300;

export default async function HomePage() {
  let topScorer: Awaited<ReturnType<typeof getPlayers>>[number] | null = null;
  let mostOwned: Awaited<ReturnType<typeof getPlayers>>[number] | null = null;
  let currentEvent: Awaited<ReturnType<typeof getCurrentEvent>> | null = null;
  let clubCount = 0;
  let playerCount = 0;

  try {
    const [players, clubs, event] = await Promise.all([getPlayers(), getClubs(), getCurrentEvent()]);
    playerCount = players.length;
    clubCount = clubs.length;
    currentEvent = event || null;
    topScorer = [...players].sort((a, b) => b.total_points - a.total_points)[0] || null;
    mostOwned = [...players].sort((a, b) => b.selected_by_percent - a.selected_by_percent)[0] || null;
  } catch {
    // Homepage stays fully usable even if live FPL data is temporarily unavailable.
  }

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <section className="mb-8 grid gap-6 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 p-4 shadow-glow backdrop-blur-sm md:grid-cols-[1.3fr_0.7fr] md:p-8">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              <Sparkles size={12} /> منصة عربية متكاملة لعشاق FPL
            </span>

            <div className="space-y-4">
              <h1 className="text-balance text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">FPL Hafid</h1>
              <p className="max-w-xl text-lg font-bold leading-8 text-emerald-200 sm:text-xl">منصتك الذكية لإدارة فريقك في الفانتازي</p>
              <p className="max-w-xl text-base leading-8 text-slate-300">
                حلّل فريقك، قارن اللاعبين، خطط لتغييراتك، واكتشف أفضل الخيارات قبل كل Gameweek.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/team"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-lime-300 px-5 py-3.5 text-base font-black text-slate-900 shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02]"
              >
                <ArrowLeft size={18} />
                حلّل فريقي
              </Link>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-base font-bold text-white transition hover:bg-white/10"
              >
                <Compass size={18} />
                استكشف المنصة
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
              <StatChip label="لاعب في القاعدة" value={playerCount ? playerCount.toString() : '—'} />
              <StatChip label="نادٍ" value={clubCount ? clubCount.toString() : '—'} />
              <StatChip label="الجولة الحالية" value={currentEvent ? currentEvent.name.replace('Gameweek', 'GW') : '—'} />
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">لمحة مباشرة</p>
                <h2 className="text-xl font-extrabold">بيانات الموسم الحالي</h2>
              </div>
              <LineChart className="text-emerald-300" />
            </div>

            <div className="space-y-3">
              <PreviewRow label="أعلى نقاط" value={topScorer ? `${topScorer.web_name} · ${topScorer.total_points} نقطة` : '—'} href={topScorer ? `/players/${playerSlug(topScorer)}` : undefined} />
              <PreviewRow label="الأكثر امتلاكًا" value={mostOwned ? `${mostOwned.web_name} · ${mostOwned.selected_by_percent.toFixed(1)}٪` : '—'} href={mostOwned ? `/players/${playerSlug(mostOwned)}` : undefined} />
              <PreviewRow label="سعر أعلى لاعب" value={topScorer ? formatPrice(topScorer.now_cost) : '—'} />
            </div>

            <div className="mt-4">
              <DeadlineCountdown deadline={currentEvent?.deadline_time} />
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">مميزات المنصة</p>
              <h2 className="text-2xl font-black">كل ما يحتاجه مدير FPL في مكان واحد</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className={`group rounded-[1.5rem] border border-white/10 bg-gradient-to-br ${feature.accent} p-5 transition hover:-translate-y-1 hover:border-emerald-400/30`}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/70 text-emerald-200">
                  <feature.icon size={20} />
                </div>
                <h3 className="mb-2 text-lg font-black text-white">{feature.title}</h3>
                <p className="text-sm leading-7 text-slate-300">{feature.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-200 opacity-0 transition group-hover:opacity-100">
                  اكتشف المزيد <ArrowLeft size={12} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">أفضل التشكيلات</p>
              <h3 className="text-2xl font-black">أفكار تشكيلات لبداية الموسم</h3>
            </div>
            <div className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">Start of Season</div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {formationIdeas.map((formation) => (
              <div key={formation.title} className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/70">
                <div className="overflow-hidden">
                  <img src={formation.image} alt={formation.title} className="h-40 w-full object-cover" />
                </div>
                <div className="space-y-2 p-4">
                  <p className="text-lg font-black text-white">{formation.title}</p>
                  <p className="text-sm leading-7 text-slate-300">{formation.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-[1.6rem] border border-violet-400/30 bg-gradient-to-r from-[#1b4d68] via-[#3ab7d7] to-[#4a59d8] p-4 shadow-[0_0_30px_rgba(90,130,255,0.25)] md:p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_0.9fr] md:items-center">
            <div className="space-y-3 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">Mini League</p>
              <h3 className="text-2xl font-black leading-tight">انضم إلى مينيليغ FPL Hafid</h3>
              <p className="text-sm leading-7 text-cyan-50/90">تحدّ أصدقائك، شارك في الجولات، ونافس في أفضل التشكيلات في الموسم الحالي.</p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-cyan-50/80">كود الانضمام</span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-lg font-black text-yellow-200 shadow-sm">wmp1fb</span>
              </div>
              <a href="https://instagram.com/Fplhafid" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/20">
                <span>Instagram</span>
                <span>@Fplhafid</span>
              </a>
            </div>
            <div className="flex justify-center">
              <img src="/images/IMG_7050.jpeg" alt="دعوة انضمام مينيليغ FPL Hafid" className="h-full max-h-[280px] w-full rounded-[1.2rem] border border-white/20 object-cover shadow-[0_15px_35px_rgba(15,23,42,0.35)]" />
            </div>
          </div>
        </section>

        <section className="mb-10 rounded-[1.75rem] border border-amber-400/20 bg-gradient-to-br from-amber-500/10 to-transparent p-6 text-center">
          <Trophy className="mx-auto mb-3 text-amber-300" size={28} />
          <h3 className="mb-2 text-2xl font-black text-white">جاهز لتطوّر طريقتك في لعب FPL؟</h3>
          <p className="mx-auto mb-5 max-w-xl text-sm leading-7 text-slate-300">
            ابدأ بتحليل فريقك مجانًا، ثم استكشف أدوات المقارنة والمباريات والقائد لاتخاذ قرارات أذكى كل جولة.
          </p>
          <Link href="/team" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-lime-300 px-6 py-3.5 text-base font-black text-slate-900 shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02]">
            <Play size={16} className="fill-current" />
            ابدأ الآن مجانًا
          </Link>
        </section>
      </div>
    </main>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2.5 text-center">
      <p className="text-lg font-black text-white">{value}</p>
      <p className="text-[11px] text-slate-400">{label}</p>
    </div>
  );
}

function PreviewRow({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
  if (!href) return content;
  return (
    <Link href={href} className="block transition hover:border-emerald-400/40">
      {content}
    </Link>
  );
}
