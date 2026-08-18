import type { Metadata } from 'next';
import { Check, Minus, Sparkles, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FPL Hafid PRO',
  description: 'اكتشف مميزات FPL Hafid PRO: تحليل متقدم للفريق، إحصائيات تفصيلية، وتوصيات ذكية للقائد والانتقالات — قريبًا.',
  alternates: { canonical: '/pro' },
};

const FEATURES: { label: string; free: boolean; pro: boolean }[] = [
  { label: 'تحليل الفريق الأساسي', free: true, pro: true },
  { label: 'قاعدة بيانات اللاعبين ومقارنة حتى 4 لاعبين', free: true, pro: true },
  { label: 'أدوات القائد ومخطط الانتقالات', free: true, pro: true },
  { label: 'تحليل متقدم للفريق مع مقارنة بأفضل المدراء', free: false, pro: true },
  { label: 'إحصائيات لاعبين متقدمة (xG وxA تفصيلية)', free: false, pro: true },
  { label: 'توصيات ذكية أسبوعية للقائد والانتقالات', free: false, pro: true },
  { label: 'تحليل مباريات متقدم مع نماذج تنبؤية', free: false, pro: true },
  { label: 'مقارنات لاعبين غير محدودة وحفظ التشكيلات', free: false, pro: true },
  { label: 'دعم أولوية وتنبيهات مخصصة', free: false, pro: true },
];

export default function ProPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-black text-amber-200">
          <Zap size={12} className="fill-current" /> FPL Hafid PRO
        </span>
        <h1 className="mb-3 text-3xl font-black text-white sm:text-4xl">ارتقِ بمستوى إدارتك لفريقك</h1>
        <p className="mx-auto max-w-xl text-sm leading-7 text-slate-400">
          تحليلات أعمق، توصيات أذكى، وأدوات متقدمة مخصصة لمدراء FPL الجادين. النسخة المدفوعة قيد التطوير حاليًا.
        </p>
      </header>

      <div className="mb-8 overflow-x-auto rounded-[1.75rem] border border-white/10 bg-slate-950/60">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-4 text-right font-bold text-slate-400">الميزة</th>
              <th className="px-4 py-4 text-center font-black text-slate-300">FREE</th>
              <th className="px-4 py-4 text-center font-black text-amber-200">PRO</th>
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((feature) => (
              <tr key={feature.label} className="border-b border-white/5">
                <td className="px-4 py-3 text-slate-200">{feature.label}</td>
                <td className="px-4 py-3 text-center">
                  {feature.free ? <Check size={16} className="mx-auto text-emerald-300" /> : <Minus size={16} className="mx-auto text-slate-600" />}
                </td>
                <td className="px-4 py-3 text-center">
                  {feature.pro ? <Check size={16} className="mx-auto text-amber-300" /> : <Minus size={16} className="mx-auto text-slate-600" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-[1.75rem] border border-amber-400/20 bg-gradient-to-br from-amber-500/10 to-transparent p-8 text-center">
        <Sparkles className="mx-auto mb-3 text-amber-300" size={26} />
        <h2 className="mb-2 text-2xl font-black text-white">الاشتراكات قادمة قريبًا</h2>
        <p className="mx-auto mb-5 max-w-md text-sm leading-7 text-slate-300">
          نعمل حاليًا على إطلاق FPL Hafid PRO. تابعنا على Instagram لتكون أول من يعرف عند الإطلاق.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button type="button" disabled className="cursor-not-allowed rounded-2xl bg-slate-800 px-6 py-3 text-sm font-black text-slate-500">
            الترقية الآن — قريبًا
          </button>
          <a
            href="https://instagram.com/Fplhafid"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-6 py-3 text-sm font-black text-amber-200 transition hover:bg-amber-400/20"
          >
            تابعنا على Instagram
          </a>
        </div>
      </div>
    </div>
  );
}
