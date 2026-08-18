import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BarChart3, CalendarRange, Crown, Repeat, Target, Wrench } from 'lucide-react';

export const metadata: Metadata = {
  title: 'أدوات FPL',
  description: 'مجموعة أدوات FPL Hafid الذكية: اختيار القائد، مخطط الانتقالات، مخطط التشكيلة، مقارنة اللاعبين، وتحليل المباريات.',
  alternates: { canonical: '/tools' },
};

const tools = [
  { title: 'تحليل الفريق', desc: 'تقييم شامل لتشكيلتك الحالية بناءً على معرّف الفريق.', href: '/team', icon: Target, status: 'متاح' },
  { title: 'اختيار القائد', desc: 'ترتيب أفضل خيارات القيادة للجولة القادمة بناءً على الفورمة والمباريات.', href: '/tools/captain', icon: Crown, status: 'متاح' },
  { title: 'مخطط الانتقالات', desc: 'قارن بين لاعب تريد بيعه وبديل محتمل قبل اتخاذ القرار.', href: '/tools/transfers', icon: Repeat, status: 'متاح' },
  { title: 'مخطط التشكيلة', desc: 'ابنِ تشكيلة من 15 لاعبًا ضمن الميزانية وقواعد FPL الرسمية.', href: '/tools/squad-planner', icon: Wrench, status: 'متاح' },
  { title: 'مقارنة اللاعبين', desc: 'قارن حتى 4 لاعبين جنبًا إلى جنب في كل الإحصائيات المهمة.', href: '/compare', icon: BarChart3, status: 'متاح' },
  { title: 'تحليل المباريات', desc: 'استعرض صعوبة المباريات القادمة (FDR) لكل نادٍ.', href: '/fixtures', icon: CalendarRange, status: 'متاح' },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-500/10 text-rose-200">
          <Wrench size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">أدوات FPL</h1>
          <p className="text-sm text-slate-400">كل أدوات FPL Hafid الذكية في مكان واحد</p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 transition hover:-translate-y-1 hover:border-emerald-400/30"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-emerald-200">
                <tool.icon size={20} />
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-200">{tool.status}</span>
            </div>
            <h3 className="mb-2 text-lg font-black text-white">{tool.title}</h3>
            <p className="text-sm leading-7 text-slate-300">{tool.desc}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-200 opacity-0 transition group-hover:opacity-100">
              فتح الأداة <ArrowLeft size={12} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
